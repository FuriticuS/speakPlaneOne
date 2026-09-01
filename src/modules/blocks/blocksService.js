import { query } from '../../config/db.js';
import { AppError } from '../../utils/appError.js';
import { BLOCK, BLOCK_EDGES } from '../../config/constants.js';
import { capacity, positionAdjacent, parseBbox } from './blocksGeometry.js';

const BLOCK_COLUMNS = 'id, content, x, y, width, height, parent_id, edge, owner_id, created_at';

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

  // 2. Все существующие блоки — для проверки пересечений.
  const allResult = await query(`SELECT x, y, width, height FROM blocks`);
  const existing = allResult.rows;

  const overlaps = (rect) => existing.some((block) => rectsOverlap(rect, block));

  // 3. Перебираем родителя, грань и случайный размер. Новый блок прижимается
  //    к грани и сдвигается вдоль неё к точке клика (positionAdjacent), поэтому
  //    он может лечь в пустоту между несколькими блоками и примагнититься сразу
  //    к нескольким соседям, а не только к одной свободной грани.
  const ATTEMPTS_PER_EDGE = 20;
  let best = null;

  for (const parent of nearby.rows) {
    for (const edge of BLOCK_EDGES) {
      for (let attempt = 0; attempt < ATTEMPTS_PER_EDGE; attempt += 1) {
        const width = BLOCK.MIN_SIZE + Math.random() * (BLOCK.MAX_SIZE - BLOCK.MIN_SIZE);
        const height = BLOCK.MIN_SIZE + Math.random() * (BLOCK.MAX_SIZE - BLOCK.MIN_SIZE);
        const pos = positionAdjacent(parent, edge, width, height, x, y);
        const rect = { ...pos, width, height };

        if (overlaps(rect)) continue;

        const distance = distanceToRect(x, y, rect);
        const area = width * height;
        // Ближе к клику — лучше; при равном расстоянии — блок крупнее.
        if (
          !best ||
          distance < best.distance ||
          (distance === best.distance && area > best.area)
        ) {
          best = { parent, edge, pos, width, height, distance, area };
        }
      }
    }
  }

  if (!best) {
    throw new AppError('No free space nearby', 400);
  }

  const result = await query(
    `INSERT INTO blocks (content, x, y, width, height, parent_id, edge, owner_id)
     VALUES (NULL, $1, $2, $3, $4, $5, $6, $7)
     RETURNING ${BLOCK_COLUMNS}`,
    [best.pos.x, best.pos.y, best.width, best.height, best.parent.id, best.edge, user.id],
  );
  return withCapacity(result.rows[0]);
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
