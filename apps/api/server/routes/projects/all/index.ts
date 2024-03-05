import { contract } from '@/contract';
import { ProjectDbModel, type Project } from '@/db/schemas';
import { auth } from '@/server/middleware/auth';
import { log } from '@/util/log';
import { initServer } from '@ts-rest/express';
import { stopAllJob } from './_helper';

const s = initServer();

export const routerAllProjects = s.router(contract.projects.all, {
  projectsAll: {
    middleware: [auth('bearerJWT')],
    handler: async ({ query, req: { currentUser } }) => {
      if (currentUser?.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const filters: Partial<Pick<Project, 'owner' | 'active' | 'ephemeral'>> = {
        owner: currentUser.id,
      };
      if (query.active) filters.active = query.active === 'true' ? true : false;
      if (query.ephemeral) filters.ephemeral = query.ephemeral === 'true' ? true : false;

      const projects = await ProjectDbModel.find(filters)
        .select(['-results', '-preferences'])
        .populate('owner', ['id', 'name', 'role']);

      return { status: 200, body: projects };
    },
  },
  projectsStop: {
    middleware: [auth('bearerJWT')],
    handler: async ({ req: { currentUser } }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      await stopAllJob();

      log.warn('All Projects stopped');

      return { status: 200, body: { message: 'All Projects stopped' } };
    },
  },
});
