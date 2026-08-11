import { z } from 'zod';

const pageBodySchema = z.object({
  title: z.string().trim().min(1, 'Page title is required').max(120, 'Page title must be at most 120 characters'),
  content: z.string().trim().max(5000, 'Content must be at most 5000 characters').optional(),
});

const pageParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Page id must be a number'),
});

export { pageBodySchema, pageParamsSchema };
