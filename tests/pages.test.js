import test from 'node:test';
import assert from 'node:assert/strict';
import { pageBodySchema, pageParamsSchema } from '../src/schemas/entities/page.js';
import { pageListParamsSchema, pageItemParamsSchema } from '../src/utils/schemas.js';

// ==================== pageBodySchema ====================

test('pageBodySchema — валидное тело страницы', () => {
  const result = pageBodySchema.parse({ title: 'My Page', content: 'Hello world' });
  assert.equal(result.title, 'My Page');
  assert.equal(result.content, 'Hello world');
});

test('pageBodySchema — content опционален', () => {
  const result = pageBodySchema.parse({ title: 'Only title' });
  assert.equal(result.title, 'Only title');
  assert.equal(result.content, undefined);
});

test('pageBodySchema — отклоняет пустой title', () => {
  assert.throws(() => pageBodySchema.parse({ title: '' }), (err) => {
    assert.ok(err.issues[0].message.includes('title'));
    return true;
  });
});

test('pageBodySchema — отклоняет отсутствующий title', () => {
  assert.throws(() => pageBodySchema.parse({}), (err) => {
    assert.ok(err.issues.length > 0);
    return true;
  });
});

test('pageBodySchema — отклоняет title длиннее 120 символов', () => {
  assert.throws(() => pageBodySchema.parse({ title: 'A'.repeat(121) }), (err) => {
    assert.ok(err.issues[0].message.includes('120'));
    return true;
  });
});

test('pageBodySchema — title ровно 120 символов — ок', () => {
  assert.doesNotThrow(() => pageBodySchema.parse({ title: 'A'.repeat(120) }));
});

test('pageBodySchema — content длиннее 5000 символов — ошибка', () => {
  assert.throws(() => pageBodySchema.parse({ title: 'Ok', content: 'A'.repeat(5001) }), (err) => {
    assert.ok(err.issues[0].message.includes('5000'));
    return true;
  });
});

test('pageBodySchema — partial() позволяет пустой объект', () => {
  assert.doesNotThrow(() => pageBodySchema.partial().parse({}));
});

test('pageBodySchema — partial() позволяет только title', () => {
  const result = pageBodySchema.partial().parse({ title: 'Updated' });
  assert.equal(result.title, 'Updated');
});

test('pageBodySchema — partial() позволяет только content', () => {
  const result = pageBodySchema.partial().parse({ content: 'Updated content' });
  assert.equal(result.content, 'Updated content');
});

// ==================== pageParamsSchema ====================

test('pageParamsSchema — валидный id', () => {
  assert.doesNotThrow(() => pageParamsSchema.parse({ id: '42' }));
});

test('pageParamsSchema — отклоняет нечисловой id', () => {
  assert.throws(() => pageParamsSchema.parse({ id: 'abc' }), (err) => {
    assert.ok(err.issues[0].message.includes('number'));
    return true;
  });
});

test('pageParamsSchema — отклоняет отрицательный id', () => {
  assert.throws(() => pageParamsSchema.parse({ id: '-5' }), (err) => {
    assert.ok(err.issues[0].message.includes('number'));
    return true;
  });
});

// ==================== pageListParamsSchema ====================

test('pageListParamsSchema — валидный projectId', () => {
  assert.doesNotThrow(() => pageListParamsSchema.parse({ projectId: '12' }));
});

test('pageListParamsSchema — отклоняет нечисловой projectId', () => {
  assert.throws(() => pageListParamsSchema.parse({ projectId: 'abc' }), (err) => {
    assert.ok(err.issues[0].message.includes('number'));
    return true;
  });
});

test('pageListParamsSchema — отклоняет отсутствующий projectId', () => {
  assert.throws(() => pageListParamsSchema.parse({}), (err) => {
    assert.ok(err.issues.length > 0);
    return true;
  });
});

// ==================== pageItemParamsSchema ====================

test('pageItemParamsSchema — валидные projectId и id', () => {
  assert.doesNotThrow(() => pageItemParamsSchema.parse({ projectId: '12', id: '5' }));
});

test('pageItemParamsSchema — отклоняет отсутствующий id', () => {
  assert.throws(() => pageItemParamsSchema.parse({ projectId: '12' }), (err) => {
    assert.ok(err.issues.length > 0);
    return true;
  });
});

test('pageItemParamsSchema — отклоняет нечисловой id', () => {
  assert.throws(() => pageItemParamsSchema.parse({ projectId: '12', id: 'abc' }), (err) => {
    assert.ok(err.issues[0].message.includes('number'));
    return true;
  });
});
