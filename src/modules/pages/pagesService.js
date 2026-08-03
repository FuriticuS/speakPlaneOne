import { query } from '../../config/db.js';

const listPages = async ({ user, projectId, query = {} }) => {
  const { isAdmin = false, id: userId } = user || {};
  const { page = 1, limit = 20 } = query;

  const offset = (Number(page) - 1) * Number(limit);

  const projectResult = await query(
    `SELECT id, owner_id, is_public FROM projects WHERE id = $1`,
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
      SELECT id, title, content, project_id, created_at
      FROM pages
      WHERE project_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [projectId, Number(limit), offset]
  );

  return result.rows;
};

const createPage = async ({ user, projectId, body }) => {
  const { id: userId } = user || {};
  const { title, content = '' } = body;

  const projectResult = await query(
    `SELECT owner_id FROM projects WHERE id = $1`,
    [projectId]
  );

  if (projectResult.rows.length === 0) {
    return null;
  }

  const project = projectResult.rows[0];
  if (project.owner_id !== userId) {
    return null;
  }

  const result = await query(
    `
      INSERT INTO pages (title, content, project_id)
      VALUES ($1, $2, $3)
      RETURNING id, title, content, project_id, created_at
    `,
    [title, content, projectId]
  );

  return result.rows[0];
};

const getPageById = async ({ user, projectId, id }) => {
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
    `SELECT id, title, content, project_id, created_at FROM pages WHERE id = $1 AND project_id = $2`,
    [id, projectId]
  );

  return result.rows[0] || null;
};

const updatePage = async ({ user, projectId, id, body }) => {
  const { isAdmin = false, id: userId } = user || {};
  const { title, content } = body;

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

  if (title !== undefined) {
    fields.push(`title = $${values.length + 1}`);
    values.push(title);
  }

  if (content !== undefined) {
    fields.push(`content = $${values.length + 1}`);
    values.push(content);
  }

  values.push(id, projectId);

  const result = await query(
    `
      UPDATE pages
      SET ${fields.join(', ')}
      WHERE id = $${values.length - 1} AND project_id = $${values.length}
      RETURNING id, title, content, project_id, created_at
    `,
    values
  );

  return result.rows[0] || null;
};

const deletePage = async ({ user, projectId, id }) => {
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

  await query('DELETE FROM pages WHERE id = $1 AND project_id = $2', [id, projectId]);
  return true;
};

export { listPages, createPage, getPageById, updatePage, deletePage };
