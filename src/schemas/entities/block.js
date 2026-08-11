import { z } from 'zod';

const blockBodySchema = z.object({
  type: z.enum(['text', 'image', 'button'], { errorMap: () => ({ message: 'Block type must be text, image or button' }) }),
  payload: z.record(z.any()).optional(),
});

const blockParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Block id must be a number'),
});

export { blockBodySchema, blockParamsSchema };
