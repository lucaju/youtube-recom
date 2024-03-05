import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const contractNotifications = c.router(
  {
    email: {
      method: 'GET',
      path: `/email`,
      headers: z.object({
        authorization: z.string(),
      }),
      responses: {
        200: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Collect a specific video',
    },
    discord: {
      method: 'GET',
      path: `/discord`,
      headers: z.object({
        authorization: z.string(),
      }),
      responses: {
        200: c.type<{ message: string }>(),
        401: c.type<{ message: string }>(),
        500: c.type<{ message: string }>(),
      },
      summary: 'Collect a specific video',
    },
  },
  {
    pathPrefix: '/notifications',
  },
);
