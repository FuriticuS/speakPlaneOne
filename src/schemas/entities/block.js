import { z } from 'zod';

const blockBodySchema = z.object({
  type: z.enum(['text', 'image', 'button'], { errorMap: () => ({ message: 'Block type must be text, image or button' }) }),
  content: z.string().trim().max(5000, 'Content must be at most 5000 characters').optional(),
  pageId: z.string().regex(/^\d+$/, 'Page id must be a number'),
});

const blockParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Block id must be a number'),
});

export { blockBodySchema, blockParamsSchema };
