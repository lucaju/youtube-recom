import { userSchema } from '@/types/user';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const contractUsers = c.router(
  {
    login: {
      method: 'GET',
      path: `/login`,
      headers: z.object({
        authorization: z.string(),
      }),
      responses: {
        200: z.object({ user: userSchema, token: z.string() }),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Login user',
    },
    logout: {
      method: 'GET',
      path: `/logout`,
      headers: z.object({
        authorization: z.string(),
      }),
      responses: {
        200: c.type<{ message?: string }>(),
        401: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Logout user',
    },
    getAll: {
      method: 'GET',
      path: `/`,
      headers: z.object({
        authorization: z.string(),
      }),
      responses: {
        200: userSchema.array(),
        401: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Get users',
    },
    get: {
      method: 'GET',
      path: `/:id`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: z.object({
        id: userSchema.shape.id.or(z.literal('me')),
      }),
      responses: {
        200: userSchema,
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Get user',
    },
    create: {
      method: 'POST',
      path: `/`,
      headers: z.object({
        authorization: z.string(),
      }),
      body: userSchema.omit({ id: true, createdAt: true, updatedAt: true }).strict(),
      responses: {
        201: userSchema,
        401: c.type<{ message: string }>(),
        409: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Create user',
    },
    update: {
      method: 'PATCH',
      path: `/:id`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: z.object({
        id: userSchema.shape.id.or(z.literal('me')),
      }),
      body: userSchema.omit({ id: true }).partial().strict(),
      responses: {
        200: userSchema,
        400: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Update user',
    },
    delete: {
      method: 'DELETE',
      path: `/:id`,
      headers: z.object({
        authorization: z.string(),
      }),
      pathParams: z.object({
        id: userSchema.shape.id.or(z.literal('me')),
      }),
      body: z.object({}),
      responses: {
        200: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        404: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Update user',
    },
  },
  {
    pathPrefix: '/users',
  },
);
