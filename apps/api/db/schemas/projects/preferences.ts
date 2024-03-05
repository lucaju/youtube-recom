import { Schema } from 'mongoose';
import z from 'zod';

export const projectPreferencesSchema = z.object({
  notification: z.object({
    email: z.boolean().default(true),
    discord: z.boolean().default(true),
  }),
});
export type ProjectPreferences = z.infer<typeof projectPreferencesSchema>;

export const ProjectPreferencesDbSchema = new Schema<ProjectPreferences>(
  {
    notification: {
      email: { type: Boolean, default: true },
      discord: { type: Boolean, default: true },
    },
  },
  { _id: false },
);
