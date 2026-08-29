import { query } from '../../config/db.js';
import { AppError } from '../../utils/appError.js';
import { BLOCK, BLOCK_EDGES } from '../../config/constants.js';
import { capacity, positionForEdge, parseBbox } from './blocksGeometry.js';

const BLOCK_COLUMNS = 'id, content, x, y, width, height, parent_id, edge, owner_id, created_at';

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
    return result.rows;
  }

  const result = await query(`SELECT ${BLOCK_COLUMNS} FROM blocks ORDER BY id`);
  return result.rows;
};

const getBlockById = async (id) => {
  const result = await query(`SELECT ${BLOCK_COLUMNS} FROM blocks WHERE id = $1`, [id]);
  return result.rows[0] || null;
};

const createBlock = async ({ user, x, y }) => {
  // 1. Блоки рядом с точкой клика (в радиусе SEARCH_RADIUS).
  const nearby = await query(
    `SELECT id, x, y, width, height FROM blocks
     WHERE x - $1 <= $3 AND x + width + $1 >= $3
       AND y - $1 <= $4 AND y + height + $1 >= $4`,
    [BLOCK.SEARCH_RADIUS, BLOCK.SEARCH_RADIUS, x, y],
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

  // 3. Кандидаты: блоки, у которых есть хотя бы одна свободная грань.
  const candidates = nearby.rows
    .map((block) => ({
      block,
      free: BLOCK_EDGES.filter((edge) => !(usedByParent.get(block.id) || new Set()).has(edge)),
    }))
    .filter((candidate) => candidate.free.length > 0);

  if (candidates.length === 0) {
    throw new AppError('No free edges nearby', 400);
  }

  // 4. Случайный выбор блока и свободной грани.
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const edge = pick.free[Math.floor(Math.random() * pick.free.length)];
  const parent = pick.block;

  // 5. Случайный размер нового блока.
  const width = BLOCK.MIN_SIZE + Math.random() * (BLOCK.MAX_SIZE - BLOCK.MIN_SIZE);
  const height = BLOCK.MIN_SIZE + Math.random() * (BLOCK.MAX_SIZE - BLOCK.MIN_SIZE);

  const pos = positionForEdge(parent, edge, width, height);

  const result = await query(
    `INSERT INTO blocks (content, x, y, width, height, parent_id, edge, owner_id)
     VALUES (NULL, $1, $2, $3, $4, $5, $6, $7)
     RETURNING ${BLOCK_COLUMNS}`,
    [pos.x, pos.y, width, height, parent.id, edge, user.id],
  );

  return result.rows[0];
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
  return result.rows[0];
};

const deleteBlock = async ({ user, id }) => {
  if (user?.role !== 'admin') throw new AppError('Only admin can delete blocks', 403);

  const result = await query(`DELETE FROM blocks WHERE id = $1 RETURNING id`, [id]);
  if (result.rowCount === 0) throw new AppError('Block not found', 404);
  return result.rows[0];
};

export { listBlocks, getBlockById, createBlock, updateBlock, deleteBlock };
