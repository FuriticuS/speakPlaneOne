import { query } from '../../config/db.js';

const listProjects = async ({ user, query: queryData = {} }) => {
  const { isAdmin = false, id: userId } = user || {};
  const { page = 1, limit = 20, is_public } = queryData;

  const offset = (Number(page) - 1) * Number(limit);

  let where = 'WHERE 1=1';
  let params = [];

  if (is_public !== undefined) {
    where += ' AND is_public = $1';
    params.push(is_public === 'true');
  }

  if (!isAdmin) {
    where += ' AND (is_public = true OR owner_id = $' + (params.length + 1) + ')';
    params.push(userId);
  }

  const sql = `
    SELECT id, name, description, is_public, owner_id, created_at
    FROM projects
    ${where}
    ORDER BY created_at DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  params.push(Number(limit), offset);

  const result = await query(sql, params);
  return result.rows;
};

const createProject = async ({ user, body }) => {
  const { id: ownerId } = user || {};
  const { name, description = '', is_public = false } = body;

  const result = await query(
    `
      INSERT INTO projects (name, description, is_public, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, is_public, owner_id, created_at
    `,
    [name, description, is_public, ownerId]
  );

  return result.rows[0];
};

const getProjectById = async ({ user, id }) => {
  const { isAdmin = false, id: userId } = user || {};

  const result = await query(
    `
      SELECT id, name, description, is_public, owner_id, created_at
      FROM projects
      WHERE id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const project = result.rows[0];

  if (!isAdmin && !project.is_public && project.owner_id !== userId) {
    return null;
  }

  return project;
};

const updateProject = async ({ user, id, body }) => {
  const { isAdmin = false, id: userId } = user || {};
  const { name, description, is_public } = body;

  const existing = await query('SELECT owner_id FROM projects WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    return null;
  }

  if (!isAdmin && existing.rows[0].owner_id !== userId) {
    return null;
  }

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push(`name = $${values.length + 1}`);
    values.push(name);
  }

  if (description !== undefined) {
    fields.push(`description = $${values.length + 1}`);
    values.push(description);
  }

  if (is_public !== undefined) {
    fields.push(`is_public = $${values.length + 1}`);
    values.push(is_public);
  }

  values.push(id);

  if (fields.length === 0) {
    const current = await query('SELECT id, name, description, is_public, owner_id, created_at FROM projects WHERE id = $1', [id]);
    return current.rows[0] || null;
  }

  const result = await query(
    `
      UPDATE projects
      SET ${fields.join(', ')}
      WHERE id = $${values.length}
      RETURNING id, name, description, is_public, owner_id, created_at
    `,
    values
  );

  return result.rows[0];
};

const deleteProject = async ({ user, id }) => {
  const { isAdmin = false, id: userId } = user || {};

  const existing = await query('SELECT owner_id FROM projects WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    return null;
  }

  if (!isAdmin && existing.rows[0].owner_id !== userId) {
    return null;
  }

  await query('DELETE FROM projects WHERE id = $1', [id]);
  return true;
};

export { listProjects, createProject, getProjectById, updateProject, deleteProject };
