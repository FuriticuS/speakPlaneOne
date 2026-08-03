import { AppError } from './appError.js';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validateAuthInput = (payload, type = 'register') => {
  const email = payload?.email?.trim();
  const password = payload?.password;

  if (!email || !isValidEmail(email)) {
    throw new AppError('Please provide a valid email', 400);
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  if (type === 'register') {
    return { email, password };
  }

  return { email, password };
};

export { validateAuthInput };
