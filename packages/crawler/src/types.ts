import z from 'zod';

const sortTypeSchema = z.enum(['top_rated', 'view_count', 'Sorting search results by relevance']);
export type SortType = z.infer<typeof sortTypeSchema>;

export const adCompanionSchema = z.object({
  domain: z.string().optional(),
  title: z.string().optional(),
});

export type AdCompanion = z.infer<typeof adCompanionSchema>;

export const channelSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Channel = z.infer<typeof channelSchema>;

export const crawlerConfigSchema = z.object({
  branches: z.number().max(5),
  country: z.string().optional(),
  depth: z.number().max(5),
  keywords: z.array(z.string()).min(1).max(5),
  language: z.string().optional(),
  seeds: z.number().max(5),
});

export type CrawlerConfig = z.infer<typeof crawlerConfigSchema>;

export const recommendedVideoSchema = z.object({
  title: z.string().optional(),
  ytId: z.string(),
});

export type RecommendedVideo = z.infer<typeof recommendedVideoSchema>;

export const videoSchema = z.object({
  adCompanion: adCompanionSchema.optional(),
  channel: channelSchema.optional(),
  collectedAt: z.date(),
  comments: z.number().optional(),
  datePublished: z.date().optional(),
  depth: z.number(),
  description: z.string().optional(),
  duration: z.string().optional(),
  hastags: z.array(z.string()).optional(),
  likes: z.number().optional(),
  paid: z.boolean().optional(),
  recommended: z.number(),
  recommendations: z.array(recommendedVideoSchema),
  title: z.string().optional(),
  uploadDate: z.date().optional(),
  views: z.number().optional(),
  ytId: z.string(),
});

export type Video = z.infer<typeof videoSchema>;

export const crawlerResultSchema = z.object({
  date: z.date(), //DateTime
  keyword: z.string(),
  videos: z.array(videoSchema),
});

export type CrawlerResult = z.infer<typeof crawlerResultSchema>;
