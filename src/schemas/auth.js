import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export { authSchema };
