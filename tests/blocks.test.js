import test from 'node:test';
import assert from 'node:assert/strict';
import { blockBodySchema, blockParamsSchema } from '../src/schemas/entities/block.js';
import { blockListParamsSchema, blockItemParamsSchema } from '../src/utils/schemas.js';

// ==================== blockBodySchema ====================

test('blockBodySchema — валидное тело блока (text)', () => {
  const result = blockBodySchema.parse({ type: 'text', payload: { text: 'Hello' } });
  assert.equal(result.type, 'text');
  assert.deepEqual(result.payload, { text: 'Hello' });
});

test('blockBodySchema — валидное тело блока (image)', () => {
  const result = blockBodySchema.parse({ type: 'image', payload: { src: 'url' } });
  assert.equal(result.type, 'image');
});

test('blockBodySchema — валидное тело блока (button)', () => {
  const result = blockBodySchema.parse({ type: 'button' });
  assert.equal(result.type, 'button');
});

test('blockBodySchema — payload опционален', () => {
  const result = blockBodySchema.parse({ type: 'text' });
  assert.equal(result.payload, undefined);
});

test('blockBodySchema — отклоняет недопустимый type', () => {
  assert.throws(() => blockBodySchema.parse({ type: 'video' }), (err) => {
    assert.ok(err.issues[0].message.toLowerCase().includes('text') || err.issues[0].message.toLowerCase().includes('button'));
    return true;
  });
});

test('blockBodySchema — отклоняет отсутствующий type', () => {
  assert.throws(() => blockBodySchema.parse({ payload: {} }), (err) => {
    assert.ok(err.issues.length > 0);
    return true;
  });
});

test('blockBodySchema — partial() позволяет пустой объект', () => {
  assert.doesNotThrow(() => blockBodySchema.partial().parse({}));
});

test('blockBodySchema — partial() позволяет только type', () => {
  const result = blockBodySchema.partial().parse({ type: 'image' });
  assert.equal(result.type, 'image');
});

test('blockBodySchema — partial() позволяет только payload', () => {
  const result = blockBodySchema.partial().parse({ payload: { text: 'updated' } });
  assert.deepEqual(result.payload, { text: 'updated' });
});

// ==================== blockParamsSchema ====================

test('blockParamsSchema — валидный id', () => {
  assert.doesNotThrow(() => blockParamsSchema.parse({ id: '7' }));
});

test('blockParamsSchema — отклоняет нечисловой id', () => {
  assert.throws(() => blockParamsSchema.parse({ id: 'xyz' }), (err) => {
    assert.ok(err.issues[0].message.includes('number'));
    return true;
  });
});

// ==================== blockListParamsSchema ====================

test('blockListParamsSchema — валидные projectId и pageId', () => {
  assert.doesNotThrow(() => blockListParamsSchema.parse({ projectId: '1', pageId: '2' }));
});

test('blockListParamsSchema — отклоняет нечисловой projectId', () => {
  assert.throws(() => blockListParamsSchema.parse({ projectId: 'abc', pageId: '2' }), (err) => {
    assert.ok(err.issues[0].message.includes('number'));
    return true;
  });
});

test('blockListParamsSchema — отклоняет нечисловой pageId', () => {
  assert.throws(() => blockListParamsSchema.parse({ projectId: '1', pageId: 'abc' }), (err) => {
    assert.ok(err.issues[0].message.includes('number'));
    return true;
  });
});

test('blockListParamsSchema — отклоняет отсутствующий projectId', () => {
  assert.throws(() => blockListParamsSchema.parse({ pageId: '2' }), (err) => {
    assert.ok(err.issues.length > 0);
    return true;
  });
});

test('blockListParamsSchema — отклоняет отсутствующий pageId', () => {
  assert.throws(() => blockListParamsSchema.parse({ projectId: '1' }), (err) => {
    assert.ok(err.issues.length > 0);
    return true;
  });
});

// ==================== blockItemParamsSchema ====================

test('blockItemParamsSchema — валидные projectId, pageId и id', () => {
  assert.doesNotThrow(() => blockItemParamsSchema.parse({ projectId: '1', pageId: '2', id: '3' }));
});

test('blockItemParamsSchema — отклоняет отсутствующий id', () => {
  assert.throws(() => blockItemParamsSchema.parse({ projectId: '1', pageId: '2' }), (err) => {
    assert.ok(err.issues.length > 0);
    return true;
  });
});

test('blockItemParamsSchema — отклоняет нечисловой id', () => {
  assert.throws(() => blockItemParamsSchema.parse({ projectId: '1', pageId: '2', id: 'abc' }), (err) => {
    assert.ok(err.issues[0].message.includes('number'));
    return true;
  });
});
