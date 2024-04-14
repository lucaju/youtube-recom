import { projectSchema } from '@/types/project';
import { initContract } from '@ts-rest/core';
import type { Job } from '@whisthub/agenda';
import { z } from 'zod';

const c = initContract();

export const contractProjectsJobs = c.router(
  {
    getAll: {
      method: 'GET',
      path: '/',
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: projectSchema.pick({ id: true }),
      responses: {
        200: c.type<Job['attrs'][]>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: "Get a project's jobs",
    },
  },
  {
    pathPrefix: '`/:id/jobs',
  },
);
