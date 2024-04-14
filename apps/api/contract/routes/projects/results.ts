import { projectResultSchema, projectSchema } from '@/types/project';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const contractProjectsResults = c.router(
  {
    getAll: {
      method: 'GET',
      path: `/`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: projectSchema.pick({ id: true }),
      responses: {
        200: z.array(
          z.object({
            id: projectResultSchema.shape.id,
            date: projectResultSchema.shape.date,
            keyword: projectResultSchema.shape.keyword,
            videos: z.number(),
          }),
        ),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Get project results',
    },
    get: {
      method: 'GET',
      path: `/:resultid`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: z.object({ id: projectSchema.shape.id, resultid: projectResultSchema.shape.id }),
      query: z.object({
        limit_videos: z
          .string()
          .refine((value) => (Number(value) >= 0 ? true : false))
          .optional(),
      }),
      responses: {
        200: projectResultSchema,
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Get a project result',
    },
  },
  {
    pathPrefix: '/:id/results',
  },
);
