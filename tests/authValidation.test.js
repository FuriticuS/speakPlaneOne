import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAuthInput } from '../src/utils/validators.js';
import { AppError } from '../src/utils/appError.js';

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
