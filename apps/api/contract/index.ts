import { initContract } from '@ts-rest/core';
import { contractCrawler, contractProjects, contractTests, contractUsers } from './routes';

const c = initContract();

export const contract = c.router(
  {
    crawler: contractCrawler,
    projects: contractProjects,
    users: contractUsers,
    tests: contractTests,
  },
  {
    strictStatusCodes: true,
  },
);
