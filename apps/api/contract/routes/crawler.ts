import { projectResultSchema, projectSchema } from '@/types/project';
import { initContract } from '@ts-rest/core';
import { videoSchema } from 'youtube-recommendation-crawler/schema';
import { z } from 'zod';

const c = initContract();

export const contractCrawler = c.router(
  {
    create: {
      method: 'POST',
      path: `/`,
      headers: z.object({
        authorization: z.string(),
      }),
      body: projectSchema.pick({
        keywords: true,
        crawlerConfig: true,
      }),
      responses: {
        200: z.object({
          crawlerId: projectSchema.shape.id,
          message: z.string(),
          result: z.array(projectResultSchema).optional(),
        }),
        201: z.object({ crawlerId: projectSchema.shape.id, message: z.string() }),
        401: c.type<{ message: string }>(),
        403: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Create Crawler Job',
    },
    video: {
      method: 'GET',
      path: `/video/:id`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: videoSchema.pick({ id: true }),
      responses: {
        200: videoSchema,
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Collect a specific video',
    },
    results: {
      method: 'GET',
      path: `/:id/result`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: projectSchema.pick({ id: true }),
      responses: {
        200: z.union([z.object({ message: z.string() }), z.array(projectResultSchema)]),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Get Crawler Job',
    },
  },
  {
    pathPrefix: '/crawler',
  },
);
