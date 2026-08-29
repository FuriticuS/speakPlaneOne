import { query } from '../../config/db.js';

const PROFILE_COLUMNS = 'id, email, role, name, gender, age, created_at';

const getProfile = async (userId) => {
  const result = await query(`SELECT ${PROFILE_COLUMNS} FROM users WHERE id = $1`, [userId]);
  return result.rows[0] || null;
};

const updateProfile = async (userId, body) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key of ['name', 'gender', 'age']) {
    if (body[key] !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(body[key]);
      index += 1;
    }
  }

  if (fields.length === 0) {
    return getProfile(userId);
  }

  values.push(userId);
  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING ${PROFILE_COLUMNS}`,
    values,
  );
  return result.rows[0];
};

export { getProfile, updateProfile };
