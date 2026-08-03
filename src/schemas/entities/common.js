import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Id must be a number'),
});

const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
});

export { idParamSchema, paginationQuerySchema };
