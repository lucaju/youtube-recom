import { LogLevelDesc } from 'loglevel';
import z from 'zod';
import { config } from '../config.ts';

export const delaySchema = z.object({
  video: z.number().default(0).describe('Delay scraper for each video in seconds').optional(),
  seed: z.number().default(0).describe('Delay scraper for each seed video in seconds').optional(),
});
export type Delay = z.infer<typeof delaySchema>;

export type CrawlerOptions = Delay & {
  delay?: Delay;
  logLevel?: LogLevelDesc;
};

export const crawlerConfigSchema = z.object({
  branches: z
    .number()
    .max(config.branches.max)
    .default(config.branches.default)
    .describe(
      'Number of branches to crawl. A branch is the list of recommended videos from a seed video.',
    )
    .optional(),
  country: z.string().describe('Filter the search to a specific country.').optional(),
  depth: z
    .number()
    .max(config.depth.max)
    .default(config.depth.default)
    .describe(
      'Number of sub-branches to crawl. Depth is how deep in foolowing recommendations the crawler should go.',
    )
    .optional(),
  language: z.string().describe('Filter the search to a specific language.').optional(),
  seeds: z
    .number()
    .max(config.seeds.max)
    .default(config.seeds.default)
    .describe(
      'Number of seed videos to crawl. A seed video is the video with listed on the search by a keyword (ranked by the YouTube).',
    )
    .optional(),
});
export type CrawlerConfig = z.infer<typeof crawlerConfigSchema>;

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

export const videoBaseSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
});
export type VideoBase = z.infer<typeof videoBaseSchema>;

export const videoCrawlerResultsSchema = z.object({
  collectedAt: z.date(),
  depth: z.number(),
  recommended: z.number(),
});
export type videoCrawlerResults = z.infer<typeof videoCrawlerResultsSchema>;

export const videoSchema = videoBaseSchema.extend({
  adCompanion: adCompanionSchema.optional(),
  channel: channelSchema.optional(),
  comments: z.number().optional(),
  crawlerResults: videoCrawlerResultsSchema.optional(),
  datePublished: z.date().optional(),
  description: z.string().optional(),
  duration: z.string().optional(),
  hastags: z.array(z.string()).optional(),
  likes: z.number().optional(),
  paid: z.boolean().optional(),
  recommendations: z.array(videoBaseSchema).optional(),
  uploadDate: z.date().optional(),
  views: z.number().optional(),
});
export type Video = z.infer<typeof videoSchema>;

export const crawlerResultSchema = z.object({
  date: z.date(),
  keyword: z.string(),
  videos: z.array(videoSchema),
});

export type CrawlerResult = z.infer<typeof crawlerResultSchema>;
