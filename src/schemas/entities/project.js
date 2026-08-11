import { z } from 'zod';

const projectBodySchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(100, 'Project name must be at most 100 characters'),
  description: z.string().trim().max(2000, 'Description must be at most 2000 characters').optional(),
  status: z.enum(['draft', 'active', 'completed'], { errorMap: () => ({ message: 'Status must be draft, active or completed' }) }).optional(),
  is_public: z.boolean().optional(),
});

const projectParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Project id must be a number'),
});

export { projectBodySchema, projectParamsSchema };
