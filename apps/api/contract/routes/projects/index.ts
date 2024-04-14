import { projectScheduleSchema, projectSchema } from '@/types/project';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { contractProjectAll } from './all';
import { contractProjectsJobs } from './jobs';
import { contractProjectsResults } from './results';

const c = initContract();

export const contractProjects = c.router(
  {
    all: contractProjectAll,
    results: contractProjectsResults,
    jobs: contractProjectsJobs,
    getAll: {
      method: 'GET',
      path: `/`,
      headers: z.object({
        authorization: z.string(),
      }),
      query: z.object({
        owner: projectSchema.shape.ownerId.optional(),
        status: projectSchema.shape.status.optional(),
        ephemeral: z.literal('true').or(z.literal('false')).optional(),
      }),
      responses: {
        200: projectSchema.array(),
        401: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Get projects',
    },
    create: {
      method: 'POST',
      path: `/`,
      headers: z.object({
        authorization: z.string(),
      }),
      body: projectSchema
        .pick({
          title: true,
          description: true,
          keywords: true,
          crawlerConfig: true,
          preferences: true,
        })
        .extend({
          schedule: projectScheduleSchema
            .pick({ frequency: true, time: true, timezone: true })
            .optional(),
        }),
      responses: {
        201: projectSchema,
        400: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Create a project',
    },
    get: {
      method: 'GET',
      path: `/:id`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: projectSchema.pick({ id: true }),
      query: z.object({ results: z.literal('true').or(z.literal('false')).optional() }),
      responses: {
        200: projectSchema,
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Get a project',
    },
    update: {
      method: 'PUT',
      path: `/:id`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: projectSchema.pick({ id: true }),
      body: projectSchema.partial(),
      responses: {
        200: projectSchema,
        400: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Update a project',
    },
    activate: {
      method: 'PATCH',
      path: `/:id/activate`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: projectSchema.pick({ id: true }),
      body: z.object({}),
      responses: {
        200: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Start a project',
    },
    deactivate: {
      method: 'PATCH',
      path: '/:id/deactivate',
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: projectSchema.pick({ id: true }),
      body: z.object({}),
      responses: {
        200: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Stop a project',
    },
    delete: {
      method: 'DELETE',
      path: `/:id`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: projectSchema.pick({ id: true }),
      body: z.object({}),
      responses: {
        200: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Delete project',
    },
  },
  {
    pathPrefix: '/projects',
  },
);
