import { projectSchema, type Project } from '@/db/schemas';
import { projectScheduleSchema } from '@/db/schemas/projects/schedule';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { contractProjectAll } from './all';
import { crawlerResultSchema } from 'youtube-recommendation-crawler';

const c = initContract();

export const contractProjects = c.router(
  {
    all: contractProjectAll,
    projects: {
      method: 'GET',
      path: `/`,
      headers: z.object({
        authorization: z.string(),
      }),
      query: z.object({
        active: z.literal('true').or(z.literal('false')).optional(),
        ephemeral: z.literal('true').or(z.literal('false')).optional(),
      }),
      responses: {
        200: c.type<Project[]>(),
        401: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Get projects',
    },
    project: {
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
    projectResults: {
      method: 'GET',
      path: `/:id/results`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: projectSchema.pick({ id: true }),
      responses: {
        200: z.union([z.object({ message: z.string() }), z.array(crawlerResultSchema)]),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Get a project results',
    },
    createProject: {
      method: 'POST',
      path: `/`,
      headers: z.object({
        authorization: z.string(),
      }),
      body: projectSchema
        .pick({
          title: true,
          keywords: true,
          crawlerConfig: true,
        })
        .extend({
          schedule: projectScheduleSchema
            .pick({ frequency: true, time: true, timezone: true, preference: true })
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
    updateProject: {
      method: 'PUT',
      path: `/:id`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: projectSchema.pick({ id: true }),
      body: projectSchema.pick({ title: true }),
      responses: {
        200: projectSchema,
        400: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Update a project',
    },
    startProject: {
      method: 'PATCH',
      path: `/:id/start`,
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
    stopProject: {
      method: 'PATCH',
      path: '/:id/stop',
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
    deleteProject: {
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
        500: c.type<{ message: string }>(),
      },
      summary: 'Delete project',
    },
  },
  {
    pathPrefix: '/projects',
  },
);
