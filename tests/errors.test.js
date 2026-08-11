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

// ==================== Сценарии прав доступа (логика без БД) ====================

test('Права: guest (user = null) — не видит закрытые проекты', () => {
  const user = null;
  const project = { is_public: false, owner_id: 5 };
  const canView = user?.role === 'admin' || project.is_public || project.owner_id === user?.id;
  assert.equal(canView, false);
});

test('Права: guest (user = null) — видит публичные проекты', () => {
  const user = null;
  const project = { is_public: true, owner_id: 5 };
  const canView = user?.role === 'admin' || project.is_public || project.owner_id === user?.id;
  assert.equal(canView, true);
});

test('Права: user — видит свои закрытые проекты', () => {
  const user = { id: 5, role: 'user' };
  const project = { is_public: false, owner_id: 5 };
  const canView = user.role === 'admin' || project.is_public || project.owner_id === user.id;
  assert.equal(canView, true);
});

test('Права: user — не видит чужие закрытые проекты', () => {
  const user = { id: 5, role: 'user' };
  const project = { is_public: false, owner_id: 99 };
  const canView = user.role === 'admin' || project.is_public || project.owner_id === user.id;
  assert.equal(canView, false);
});

test('Права: user — видит чужие публичные проекты', () => {
  const user = { id: 5, role: 'user' };
  const project = { is_public: true, owner_id: 99 };
  const canView = user.role === 'admin' || project.is_public || project.owner_id === user.id;
  assert.equal(canView, true);
});

test('Права: admin — видит всё', () => {
  const user = { id: 1, role: 'admin' };
  const project = { is_public: false, owner_id: 99 };
  const canView = user.role === 'admin' || project.is_public || project.owner_id === user.id;
  assert.equal(canView, true);
});

test('Права: user — может редактировать только свои проекты', () => {
  const user = { id: 5, role: 'user' };
  const owner_id = 5;
  const canEdit = user.role === 'admin' || owner_id === user.id;
  assert.equal(canEdit, true);
});

test('Права: user — не может редактировать чужие проекты', () => {
  const user = { id: 5, role: 'user' };
  const owner_id = 99;
  const canEdit = user.role === 'admin' || owner_id === user.id;
  assert.equal(canEdit, false);
});

test('Права: admin — может редактировать всё', () => {
  const user = { id: 1, role: 'admin' };
  const owner_id = 99;
  const canEdit = user.role === 'admin' || owner_id === user.id;
  assert.equal(canEdit, true);
});

// ==================== page → project принадлежность ====================

test('Принадлежность: страница принадлежит проекту', () => {
  // Имитация проверки: page.project_id === projectId
  const page = { id: 10, project_id: 3 };
  const projectId = 3;
  assert.equal(page.project_id === projectId, true);
});

test('Принадлежность: страница НЕ принадлежит проекту', () => {
  const page = { id: 10, project_id: 3 };
  const projectId = 99;
  assert.equal(page.project_id === projectId, false);
});
