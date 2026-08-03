import { z } from 'zod';

const userIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'User id must be a number'),
});

const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
});

export { userIdParamSchema, paginationQuerySchema };
