import test from 'node:test';
import assert from 'node:assert/strict';
import {
  blockCreateSchema,
  blockUpdateSchema,
  blockParamsSchema,
  blockBboxQuerySchema,
} from '../src/schemas/entities/block.js';
import { capacity, positionForEdge, parseBbox } from '../src/modules/blocks/blocksGeometry.js';

// ==================== blockCreateSchema ====================

test('blockCreateSchema — валидные координаты (числа)', () => {
  const result = blockCreateSchema.parse({ x: 10, y: -20.5 });
  assert.equal(result.x, 10);
  assert.equal(result.y, -20.5);
});

test('blockCreateSchema — коэрсит строковые координаты', () => {
  const result = blockCreateSchema.parse({ x: '100', y: '0' });
  assert.equal(result.x, 100);
  assert.equal(result.y, 0);
});

test('blockCreateSchema — отклоняет отсутствующие координаты', () => {
  assert.throws(() => blockCreateSchema.parse({}), (err) => {
    assert.ok(err.issues.length > 0);
    return true;
  });
});

// ==================== blockUpdateSchema ====================

test('blockUpdateSchema — валидный content', () => {
  assert.equal(blockUpdateSchema.parse({ content: 'Hello' }).content, 'Hello');
});

test('blockUpdateSchema — отклоняет пустой content', () => {
  assert.throws(() => blockUpdateSchema.parse({ content: '' }));
});

// ==================== blockParamsSchema ====================

test('blockParamsSchema — валидный id', () => {
  assert.doesNotThrow(() => blockParamsSchema.parse({ id: '7' }));
});

test('blockParamsSchema — отклоняет нечисловой id', () => {
  assert.throws(() => blockParamsSchema.parse({ id: 'abc' }));
});

// ==================== blockBboxQuerySchema ====================

test('blockBboxQuerySchema — валидный bbox', () => {
  assert.doesNotThrow(() => blockBboxQuerySchema.parse({ bbox: '-10.5,0,10,20' }));
});

test('blockBboxQuerySchema — отклоняет неполный bbox', () => {
  assert.throws(() => blockBboxQuerySchema.parse({ bbox: '1,2,3' }));
});

// ==================== geometry helpers ====================

test('capacity — целочисленная оценка ёмкости', () => {
  // 100 * 100 = 10000 / (8 * 14 = 112) = 89.28 → 89
  assert.equal(capacity(100, 100), 89);
});

test('positionForEdge — приклейка по всем граням', () => {
  const parent = { x: 0, y: 0, width: 100, height: 50 };
  assert.deepEqual(positionForEdge(parent, 'south', 40, 30), { x: 0, y: 50 });
  assert.deepEqual(positionForEdge(parent, 'east', 40, 30), { x: 100, y: 0 });
  assert.deepEqual(positionForEdge(parent, 'north', 40, 30), { x: 0, y: -30 });
  assert.deepEqual(positionForEdge(parent, 'west', 40, 30), { x: -40, y: 0 });
});

test('parseBbox — разбирает строку и отдаёт null без bbox', () => {
  assert.deepEqual(parseBbox('1,2,3,4'), [1, 2, 3, 4]);
  assert.equal(parseBbox(null), null);
  assert.equal(parseBbox(undefined), null);
});
