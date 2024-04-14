import { crawlerConfigSchema, crawlerResultSchema } from 'youtube-recommendation-crawler/schema';
import { z } from 'zod';

export const scheduleFrequencies = ['once', 'daily', 'weekly', 'monthly'] as const;
export const scheduleFrequencySquema = z.enum(scheduleFrequencies);
export type ScheduleFrequency = z.infer<typeof scheduleFrequencySquema>;

export const projectScheduleSchema = z.object({
  frequency: scheduleFrequencySquema.default('once'),
  time: z.string().optional(), //.regex(hourRegexp).optional(),
  timezone: z.string().optional(),
});
export type ProjectSchedule = z.infer<typeof projectScheduleSchema>;

export const projectPreferencesSchema = z.object({
  notification: z.object({
    email: z.boolean().default(true),
    discord: z.boolean().default(true),
  }),
});
export type ProjectPreferences = z.infer<typeof projectPreferencesSchema>;

export const projectResultSchema = crawlerResultSchema.extend({
  id: z.string(),
});
export type ProjectResult = z.infer<typeof projectResultSchema>;

export const projectSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.date(),
  keywords: z.array(z.string().min(3)).min(1),
  crawlerConfig: crawlerConfigSchema,
  status: z.union([z.literal('active'), z.literal('inactive')]).default('active'),
  ephemeral: z.boolean().default(false).optional(),
  schedule: projectScheduleSchema,
  preferences: projectPreferencesSchema,
  results: z.array(projectResultSchema).optional(),
  owner: z.object({ id: z.string(), name: z.string(), email: z.string() }).optional(),
});
export type Project = z.infer<typeof projectSchema>;
