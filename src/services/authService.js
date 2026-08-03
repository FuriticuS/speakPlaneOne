import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { AppError } from '../utils/appError.js';
import { validateAuthInput } from '../utils/validators.js';

const addRefreshToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt],
  );
};

const rotateRefreshToken = async (oldToken, newToken, userId) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query('UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1', [oldToken]);
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, newToken, expiresAt],
  );
};

const revokeRefreshToken = async (token) => {
  await query('UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1', [token]);
};

const findRefreshToken = async (token) => {
  const result = await query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
  return result.rows[0];
};

const hashPassword = async (password) => bcrypt.hash(password, 10);

const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const createAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });

const createRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

const registerUser = async (payload) => {
  const { email, password } = validateAuthInput(payload, 'register');

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) {
    throw new AppError('User already exists', 409);
  }

  const passwordHash = await hashPassword(password);
  const result = await query(
    'INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, NOW()) RETURNING id, email, created_at',
    [email, passwordHash],
  );

  return result.rows[0];
};

const loginUser = async (payload) => {
  const { email, password } = validateAuthInput(payload, 'login');

  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  await addRefreshToken(user.id, refreshToken);

  return {
    user: { id: user.id, email: user.email, createdAt: user.created_at },
    accessToken,
    refreshToken,
  };
};

const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token missing', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const storedToken = await findRefreshToken(refreshToken);
  if (!storedToken || storedToken.revoked || new Date(storedToken.expires_at) < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const result = await query('SELECT id, email, created_at FROM users WHERE id = $1', [decoded.id]);
  const user = result.rows[0];

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const accessToken = createAccessToken(user);
  const newRefreshToken = createRefreshToken(user);
  await rotateRefreshToken(refreshToken, newRefreshToken, user.id);

  return { user, accessToken, refreshToken: newRefreshToken };
};

const getUserById = async (id) => {
  const result = await query('SELECT id, email, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
};

export { registerUser, loginUser, refreshUserToken, getUserById, logoutUser };
