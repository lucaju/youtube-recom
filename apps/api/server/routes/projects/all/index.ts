import { contract } from '@/contract';
import { ProjectDbModel } from '@/db/projects/models';
import { auth } from '@/server/middleware/auth';
import type { Project } from '@/types';
import { log } from '@/util/log';
import { initServer } from '@ts-rest/express';
import { stopAllJob } from './_helper';

const s = initServer();

export const routerAllProjects = s.router(contract.projects.all, {
  get: {
    middleware: [auth('bearerJWT')],
    handler: async ({ query, req: { currentUser } }) => {
      if (currentUser?.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const filters: Partial<Pick<Project, 'ownerId' | 'status' | 'ephemeral'>> = {
        ownerId: currentUser.id,
        status: query.status,
      };
      if (query.ephemeral) filters.ephemeral = query.ephemeral === 'true' ? true : false;

      const projects = await ProjectDbModel.find(filters)
        .select(['-results', '-preferences'])
        .populate('owner', ['id', 'name', 'role']);

      return { status: 200, body: projects };
    },
  },
  deactivate: {
    middleware: [auth('bearerJWT')],
    handler: async ({ req: { currentUser } }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      await stopAllJob();

      log.warn('All Projects deactivated');

      return { status: 200, body: { message: 'All Projects deactivated' } };
    },
  },
});
