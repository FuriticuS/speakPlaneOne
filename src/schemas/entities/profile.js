import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name must not be empty').max(100, 'Name is too long').optional(),
  gender: z.enum(['male', 'female', 'other', 'not_specified']).optional(),
  age: z.coerce.number().int().min(1, 'Age must be positive').max(120, 'Age is too high').optional(),
});

export { profileSchema };
