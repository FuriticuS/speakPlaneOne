import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').optional(),
  lastName: z.string().trim().min(1, 'Last name is required').optional(),
  bio: z.string().trim().max(500, 'Bio must be at most 500 characters').optional(),
  avatarUrl: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
});

export { profileSchema };
