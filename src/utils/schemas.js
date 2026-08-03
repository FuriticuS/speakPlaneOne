import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const userIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'User id must be a number'),
});

const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
});

const healthSchema = z.object({
  status: z.string().optional(),
});

export { authSchema, userIdParamSchema, paginationQuerySchema, healthSchema };
