import z from 'zod';

export const userRoles = ['admin', 'user'] as const;
export const userRoleSchema = z.enum(userRoles);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: userRoleSchema.default('user'),
  password: z
    .string()
    .regex(/^(?=.*)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .optional(),
  createdAt: z.string(),
  tokens: z.array(z.string()).optional(),
  owner: z.object({ id: z.string(), title: z.string() }).optional(),
});
export type User = z.infer<typeof userSchema>;
