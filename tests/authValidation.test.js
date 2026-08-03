import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAuthInput } from '../src/utils/validators.js';
import { AppError } from '../src/utils/appError.js';
import { pageListParamsSchema, pageItemParamsSchema, blockListParamsSchema, blockItemParamsSchema } from '../src/utils/schemas.js';

test('validateAuthInput accepts valid register payload', () => {
  const result = validateAuthInput({ email: 'user@example.com', password: 'secret123' }, 'register');
  assert.equal(result.email, 'user@example.com');
  assert.equal(result.password, 'secret123');
});

test('validateAuthInput rejects short password', () => {
  assert.throws(() => validateAuthInput({ email: 'user@example.com', password: '123' }, 'register'), (error) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.statusCode, 400);
    return true;
  });
});

test('page and block param schemas support list and item routes', () => {
  assert.doesNotThrow(() => pageListParamsSchema.parse({ projectId: '12' }));
  assert.doesNotThrow(() => pageItemParamsSchema.parse({ projectId: '12', id: '5' }));
  assert.doesNotThrow(() => blockListParamsSchema.parse({ projectId: '12', pageId: '3' }));
  assert.doesNotThrow(() => blockItemParamsSchema.parse({ projectId: '12', pageId: '3', id: '7' }));
});
