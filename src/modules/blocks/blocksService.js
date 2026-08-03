import { query } from '../../config/db.js';

const listBlocks = async ({ user, projectId, pageId, query = {} }) => {
  const { isAdmin = false, id: userId } = user || {};
  const { page = 1, limit = 20 } = query;

  const offset = (Number(page) - 1) * Number(limit);

  const projectResult = await query(
    `SELECT owner_id, is_public FROM projects WHERE id = $1`,
    [projectId]
  );

  if (projectResult.rows.length === 0) {
    return [];
  }

  const project = projectResult.rows[0];
  if (!isAdmin && !project.is_public && project.owner_id !== userId) {
    return [];
  }

  const result = await query(
    `
      SELECT id, type, payload, page_id, created_at
      FROM blocks
      WHERE page_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [pageId, Number(limit), offset]
  );

  return result.rows;
};

const createBlock = async ({ user, projectId, pageId, body }) => {
  const { id: userId } = user || {};
  const { type, payload = {} } = body;

  const projectResult = await query(
    `SELECT owner_id FROM projects WHERE id = $1`,
    [projectId]
  );

  if (projectResult.rows.length === 0) {
    return null;
  }

  if (projectResult.rows[0].owner_id !== userId) {
    return null;
  }

  const result = await query(
    `
      INSERT INTO blocks (type, payload, page_id)
      VALUES ($1, $2, $3)
      RETURNING id, type, payload, page_id, created_at
    `,
    [type, payload, pageId]
  );

  return result.rows[0];
};

const getBlockById = async ({ user, projectId, pageId, id }) => {
  const { isAdmin = false, id: userId } = user || {};

  const projectResult = await query(
    `SELECT owner_id, is_public FROM projects WHERE id = $1`,
    [projectId]
  );

  if (projectResult.rows.length === 0) {
    return null;
  }

  const project = projectResult.rows[0];
  if (!isAdmin && !project.is_public && project.owner_id !== userId) {
    return null;
  }

  const result = await query(
    `SELECT id, type, payload, page_id, created_at FROM blocks WHERE id = $1 AND page_id = $2`,
    [id, pageId]
  );

  return result.rows[0] || null;
};

const updateBlock = async ({ user, projectId, pageId, id, body }) => {
  const { isAdmin = false, id: userId } = user || {};
  const { type, payload } = body;

  const projectResult = await query(
    `SELECT owner_id FROM projects WHERE id = $1`,
    [projectId]
  );

  if (projectResult.rows.length === 0) {
    return null;
  }

  if (!isAdmin && projectResult.rows[0].owner_id !== userId) {
    return null;
  }

  const fields = [];
  const values = [];

  if (type !== undefined) {
    fields.push(`type = $${values.length + 1}`);
    values.push(type);
  }

  if (payload !== undefined) {
    fields.push(`payload = $${values.length + 1}`);
    values.push(payload);
  }

  values.push(id, pageId);

  const result = await query(
    `
      UPDATE blocks
      SET ${fields.join(', ')}
      WHERE id = $${values.length - 1} AND page_id = $${values.length}
      RETURNING id, type, payload, page_id, created_at
    `,
    values
  );

  return result.rows[0] || null;
};

const deleteBlock = async ({ user, projectId, pageId, id }) => {
  const { isAdmin = false, id: userId } = user || {};

  const projectResult = await query(
    `SELECT owner_id FROM projects WHERE id = $1`,
    [projectId]
  );

  if (projectResult.rows.length === 0) {
    return null;
  }

  if (!isAdmin && projectResult.rows[0].owner_id !== userId) {
    return null;
  }

  await query('DELETE FROM blocks WHERE id = $1 AND page_id = $2', [id, pageId]);
  return true;
};

export { listBlocks, createBlock, getBlockById, updateBlock, deleteBlock };
