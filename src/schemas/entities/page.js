import { z } from 'zod';

const pageBodySchema = z.object({
  title: z.string().trim().min(1, 'Page title is required').max(120, 'Page title must be at most 120 characters'),
  slug: z.string().trim().min(1, 'Page slug is required').max(120, 'Page slug must be at most 120 characters'),
  projectId: z.string().regex(/^\d+$/, 'Project id must be a number'),
});

const pageParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Page id must be a number'),
});

export { pageBodySchema, pageParamsSchema };
