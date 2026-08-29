import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAuthInput } from '../src/utils/validators.js';
import { AppError } from '../src/utils/appError.js';

test('validateAuthInput — валидный payload', () => {
  const result = validateAuthInput({ email: 'user@example.com', password: 'secret123' });
  assert.equal(result.email, 'user@example.com');
  assert.equal(result.password, 'secret123');
});

test('validateAuthInput — отклоняет короткий пароль', () => {
  assert.throws(() => validateAuthInput({ email: 'user@example.com', password: '123' }), (error) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.statusCode, 400);
    return true;
  });
});

test('validateAuthInput — отклоняет некорректный email', () => {
  assert.throws(() => validateAuthInput({ email: 'not-an-email', password: 'secret123' }), (error) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.statusCode, 400);
    return true;
  });
});
