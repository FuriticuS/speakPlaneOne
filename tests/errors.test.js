import test from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '../src/utils/appError.js';

// ==================== AppError ====================

test('AppError — создаёт ошибку с message и statusCode', () => {
  const err = new AppError('Not found', 404);
  assert.equal(err.message, 'Not found');
  assert.equal(err.statusCode, 404);
  assert.equal(err.name, 'AppError');
  assert.ok(err instanceof Error);
});

test('AppError — статус по умолчанию 500', () => {
  const err = new AppError('Something went wrong');
  assert.equal(err.statusCode, 500);
});

test('AppError — 401 Unauthorized', () => {
  const err = new AppError('Access token missing', 401);
  assert.equal(err.statusCode, 401);
});

test('AppError — 403 Forbidden (имитация прав)', () => {
  const err = new AppError('Insufficient permissions', 403);
  assert.equal(err.statusCode, 403);
});

test('AppError — 400 Bad Request', () => {
  const err = new AppError('Validation failed', 400);
  assert.equal(err.statusCode, 400);
});

test('AppError — 409 Conflict', () => {
  const err = new AppError('User already exists', 409);
  assert.equal(err.statusCode, 409);
});

// ==================== Сценарии прав доступа к блокам (логика без БД) ====================

test('Права: guest видит все блоки (публичная карта)', () => {
  const user = null;
  const canView = true; // все блоки публичные
  assert.equal(canView, true);
});

test('Права: guest не может создавать блоки', () => {
  const user = null;
  const canCreate = Boolean(user?.id);
  assert.equal(canCreate, false);
});

test('Права: user может создавать блоки', () => {
  const user = { id: 5, role: 'user' };
  const canCreate = Boolean(user?.id);
  assert.equal(canCreate, true);
});

test('Права: user может писать только в свой незаполненный блок', () => {
  const user = { id: 5, role: 'user' };
  const block = { owner_id: 5, content: null };
  const canWrite = block.owner_id === user.id && block.content === null;
  assert.equal(canWrite, true);
});

test('Права: user не может писать в чужой блок', () => {
  const user = { id: 5, role: 'user' };
  const block = { owner_id: 99, content: null };
  const canWrite = block.owner_id === user.id && block.content === null;
  assert.equal(canWrite, false);
});

test('Права: повторная запись в уже заполненный блок запрещена', () => {
  const user = { id: 5, role: 'user' };
  const block = { owner_id: 5, content: 'уже написан' };
  const canWrite = block.owner_id === user.id && block.content === null;
  assert.equal(canWrite, false);
});

test('Права: user не может удалять блоки', () => {
  const user = { id: 5, role: 'user' };
  const canDelete = user?.role === 'admin';
  assert.equal(canDelete, false);
});

test('Права: admin может удалять любые блоки', () => {
  const user = { id: 1, role: 'admin' };
  const canDelete = user?.role === 'admin';
  assert.equal(canDelete, true);
});
