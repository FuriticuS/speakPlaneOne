import { z } from 'zod';
import { AppError } from './appError.js';

const authSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const validateAuthInput = (payload) => {
  const parsed = authSchema.safeParse(payload);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new AppError(firstIssue.message, 400);
  }

  return parsed.data;
};

export { validateAuthInput };
