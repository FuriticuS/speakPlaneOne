import { query } from '../../config/db.js';
import { AppError } from '../../utils/appError.js';
import { BLOCK, BLOCK_EDGES } from '../../config/constants.js';
import { capacity, positionForEdge, parseBbox } from './blocksGeometry.js';

const BLOCK_COLUMNS = 'id, content, x, y, width, height, parent_id, edge, owner_id, created_at';

// Грань, противоположная той, которой блок приклеен к родителю.
// Если блок прикреплён к родителю с востока, то его западная грань занята родителем.
const OPPOSITE_EDGE = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

// Пересекаются ли два прямоугольника (касание гранями — не пересечение).
const rectsOverlap = (a, b) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

// Расстояние от точки до прямоугольника (0, если точка внутри).
const distanceToRect = (px, py, rect) => {
  const dx = Math.max(rect.x - px, 0, px - (rect.x + rect.width));
  const dy = Math.max(rect.y - py, 0, py - (rect.y + rect.height));
  return Math.hypot(dx, dy);
};

// Добавляет к блоку вычисляемое поле capacity (ёмкость текста в символах).
const withCapacity = (block) =>
  block ? { ...block, capacity: capacity(block.width, block.height) } : null;

const listBlocks = async ({ bbox } = {}) => {
  const parsed = parseBbox(bbox);

  if (parsed) {
    const [x1, y1, x2, y2] = parsed;
    const result = await query(
      `SELECT ${BLOCK_COLUMNS} FROM blocks
       WHERE x < $3 AND x + width > $1
         AND y < $4 AND y + height > $2
       ORDER BY id`,
      [x1, y1, x2, y2],
    );
    return result.rows.map(withCapacity);
  }

  const result = await query(`SELECT ${BLOCK_COLUMNS} FROM blocks ORDER BY id`);
  return result.rows.map(withCapacity);
};

const getBlockById = async (id) => {
  const result = await query(`SELECT ${BLOCK_COLUMNS} FROM blocks WHERE id = $1`, [id]);
  return withCapacity(result.rows[0]);
};

const createBlock = async ({ user, x, y }) => {
  // 1. Блоки рядом с точкой клика (в радиусе SEARCH_RADIUS).
  const nearby = await query(
    `SELECT id, x, y, width, height, edge FROM blocks
     WHERE x - $1 <= $2 AND x + width + $1 >= $2
       AND y - $1 <= $3 AND y + height + $1 >= $3`,
    [BLOCK.SEARCH_RADIUS, x, y],
  );

  if (nearby.rowCount === 0) {
    throw new AppError('No blocks nearby to attach', 400);
  }

  const ids = nearby.rows.map((row) => row.id);

  // 2. Грани, уже занятые детьми, у найденных блоков.
  const usedResult = await query(
    `SELECT parent_id, edge FROM blocks WHERE parent_id = ANY($1::int[]) AND edge IS NOT NULL`,
    [ids],
  );

  const usedByParent = new Map();
  for (const row of usedResult.rows) {
    if (!usedByParent.has(row.parent_id)) usedByParent.set(row.parent_id, new Set());
    usedByParent.get(row.parent_id).add(row.edge);
  }

  // 3. Кандидаты: блоки со свободной гранью. Грань, обращённая к родителю,
  //    тоже считается занятой (иначе новый блок лёг бы поверх родителя).
  const candidates = nearby.rows
    .map((block) => {
      const used = usedByParent.get(block.id) || new Set();
      if (block.edge) used.add(OPPOSITE_EDGE[block.edge]);
      const free = BLOCK_EDGES.filter((edge) => !used.has(edge));
      return { block, free };
    })
    .filter((candidate) => candidate.free.length > 0);

  if (candidates.length === 0) {
    throw new AppError('No free edges nearby', 400);
  }

  // 4. Все существующие блоки — для проверки пересечений.
  const allResult = await query(`SELECT x, y, width, height FROM blocks`);
  const existing = allResult.rows;

  const overlaps = (rect) => existing.some((block) => rectsOverlap(rect, block));

  // 5. Сортируем кандидатов по расстоянию до клика — примагничиваемся
  //    к ближайшему блоку, а не к случайному.
  const orderedCandidates = [...candidates].sort(
    (a, b) => distanceToRect(x, y, a.block) - distanceToRect(x, y, b.block),
  );

  for (const { block: parent, free } of orderedCandidates) {
    const shuffledEdges = [...free].sort(() => Math.random() - 0.5);

    for (const edge of shuffledEdges) {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const width = BLOCK.MIN_SIZE + Math.random() * (BLOCK.MAX_SIZE - BLOCK.MIN_SIZE);
        const height = BLOCK.MIN_SIZE + Math.random() * (BLOCK.MAX_SIZE - BLOCK.MIN_SIZE);
        const pos = positionForEdge(parent, edge, width, height);

        if (!overlaps({ ...pos, width, height })) {
          const result = await query(
            `INSERT INTO blocks (content, x, y, width, height, parent_id, edge, owner_id)
             VALUES (NULL, $1, $2, $3, $4, $5, $6, $7)
             RETURNING ${BLOCK_COLUMNS}`,
            [pos.x, pos.y, width, height, parent.id, edge, user.id],
          );
          return withCapacity(result.rows[0]);
        }
      }
    }
  }

  throw new AppError('No free space nearby', 400);
};

const updateBlock = async ({ user, id, content }) => {
  const existing = await getBlockById(id);
  if (!existing) throw new AppError('Block not found', 404);
  if (existing.owner_id !== user.id) throw new AppError('You can only write your own block', 403);
  if (existing.content !== null) {
    throw new AppError('Block text already written (editing is not allowed)', 409);
  }

  const cap = capacity(existing.width, existing.height);
  if (content.length > cap) {
    throw new AppError(`Text is too long for this block (max ${cap} characters)`, 400);
  }

  const result = await query(
    `UPDATE blocks SET content = $1 WHERE id = $2 RETURNING ${BLOCK_COLUMNS}`,
    [content, id],
  );
  return withCapacity(result.rows[0]);
};

const deleteBlock = async ({ user, id }) => {
  if (user?.role !== 'admin') throw new AppError('Only admin can delete blocks', 403);

  const result = await query(`DELETE FROM blocks WHERE id = $1 RETURNING id`, [id]);
  if (result.rowCount === 0) throw new AppError('Block not found', 404);
  return result.rows[0];
};

export { listBlocks, getBlockById, createBlock, updateBlock, deleteBlock };
