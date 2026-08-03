import { z } from 'zod';

const postSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title must be at most 120 characters'),
  content: z.string().trim().min(1, 'Content is required').max(5000, 'Content must be at most 5000 characters'),
  published: z.boolean().optional(),
});

export { postSchema };
