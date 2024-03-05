import { contract } from '@/contract';
import { initServer } from '@ts-rest/express';
import { routerNotifications } from './notifications';

const s = initServer();

export const routerTests = s.router(contract.tests, {
  notifications: routerNotifications,
});
