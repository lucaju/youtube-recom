import { contract } from '@/contract';
import { initServer } from '@ts-rest/express';
import { routerCrawler } from './crawler';
import { routerProjects } from './projects';
import { routerTests } from './tests';
import { routerUsers } from './users';

const s = initServer();

export const router = s.router(contract, {
  crawler: routerCrawler,
  projects: routerProjects,
  users: routerUsers,
  tests: routerTests,
});
