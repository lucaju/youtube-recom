import { initContract } from '@ts-rest/core';
import { contractNotifications } from './notifications';

const c = initContract();

export const contractTests = c.router(
  {
    notifications: contractNotifications,
  },
  {
    pathPrefix: '/tests',
  },
);
