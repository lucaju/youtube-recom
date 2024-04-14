import { contract } from '@/contract';
import { ProjectDbModel } from '@/db/projects/models';
import { auth, bearerJWT } from '@/server/middleware/auth';
import { initServer } from '@ts-rest/express';

const s = initServer();

export const routerProjectsResults = s.router(contract.projects.results, {
  getAll: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const project = await ProjectDbModel.findById(params.id).select('results');

      if (!project) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      if (!project.results) {
        return { status: 200, body: [] };
      }

      //Summary
      const summary = project.toObject().results?.map((result) => {
        return {
          id: result.id,
          date: result.date,
          keyword: result.keyword,
          videos: result.videos.length,
        };
      });

      if (!summary) {
        return { status: 200, body: [] };
      }

      return { status: 200, body: summary.reverse() };
    },
  },
  get: {
    middleware: [
      async (req, _res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
          next();
          return;
        }

        const currentUser = await bearerJWT(token);
        if (!currentUser) {
          next();
          return;
        }

        req.currentUser = currentUser;
        req.token = token;

        next();
      },
    ],
    handler: async ({ params, query, req: { currentUser } }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const project = await ProjectDbModel.findById(params.id).select('results');

      if (!project) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      const result = project.toObject().results?.find((result) => result.id === params.resultid);

      if (!result) {
        return { status: 404, body: { message: 'Result not found' } };
      }

      if (query.limit_videos) {
        result.videos = result.videos.slice(0, parseInt(query.limit_videos) ?? 0);
      }

      return { status: 200, body: result };
    },
  },
});
