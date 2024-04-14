import { contract } from '@/contract';
import { ProjectDbModel } from '@/db/projects/models';
import { agenda } from '@/scheduler';
import { auth } from '@/server/middleware/auth';
import { initServer } from '@ts-rest/express';

const s = initServer();

export const routerProjectsJobs = s.router(contract.projects.jobs, {
  getAll: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const project = await ProjectDbModel.findById(params.id).select('id');
      if (!project) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      const jobs = await agenda.jobs({ name: 'crawler', 'data.projectId': params.id });
      const jobsAttr = jobs.map((job) => job.attrs);

      return { status: 200, body: jobsAttr };
    },
  },
});
