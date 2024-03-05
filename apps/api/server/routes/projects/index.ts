import { contract } from '@/contract';
import { ProjectDbModel, type Project } from '@/db/schemas';
import { auth, bearerJWT } from '@/server/middleware/auth';
import { log } from '@/util/log';
import { initServer } from '@ts-rest/express';
import * as actions from './_helper';
import { routerAllProjects } from './all';

const s = initServer();

export const routerProjects = s.router(contract.projects, {
  all: routerAllProjects,
  projects: {
    middleware: [auth('bearerJWT')],
    handler: async ({ query, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const filters: Partial<Pick<Project, 'owner' | 'active' | 'ephemeral'>> = {
        owner: currentUser.id,
      };
      if (query.active) filters.active = query.active === 'true' ? true : false;
      if (query.ephemeral) filters.ephemeral = query.ephemeral === 'true' ? true : false;

      const projects = await ProjectDbModel.find(filters).select([
        '-owner',
        '-results',
        '-preferences',
      ]);

      return { status: 200, body: projects };
    },
  },
  project: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, query, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const owner = currentUser.role === 'admin' ? undefined : currentUser.id;
      const includeResults = !query.results ? undefined : query.results === 'true' ? true : false;

      const project = await ProjectDbModel.findOne({
        _id: params.id,
        ...(owner ? { owner } : {}),
      }).select(includeResults ? '' : '-results');

      if (!project) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      return { status: 200, body: project };
    },
  },
  projectResults: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const owner = currentUser.role === 'admin' ? undefined : currentUser.id;

      const project = await ProjectDbModel.findOne({
        _id: params.id,
        ...(owner ? { owner } : {}),
      }).select('results');

      if (!project) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      if (!project.results) {
        return { status: 200, body: { message: 'There are no results for this project yet' } };
      }

      return { status: 200, body: project.results };
    },
  },
  createProject: {
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
    handler: async ({ body, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }
      const project = await actions.createProject(currentUser.id, body);

      return { status: 201, body: project };
    },
  },
  updateProject: {
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
    handler: async ({ params, body, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const owner = currentUser.role === 'admin' ? undefined : currentUser.id;

      const updatedProject = await actions.updateProject(
        { id: params.id, owner },
        { title: body.title },
      );

      if (!updatedProject) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      return { status: 200, body: updatedProject };
    },
  },
  deleteProject: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const owner = currentUser.role === 'admin' ? undefined : currentUser.id;
      const deletedProject = await actions.deleteProject(params.id, owner);

      if (!deletedProject) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      return { status: 200, body: { message: 'Project removed' } };
    },
  },
  startProject: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const owner = currentUser.role === 'admin' ? undefined : currentUser.id;
      const project = await actions.startJob(params.id, owner);

      if (!project) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      log.warn(`Project ${project._id} started`);

      return { status: 200, body: { message: 'Project started' } };
    },
  },
  stopProject: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const owner = currentUser.role === 'admin' ? undefined : currentUser.id;
      const project = await actions.stopJob(params.id, owner);

      if (!project) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      log.warn(`Project ${project._id} stopped`);

      return { status: 200, body: { message: 'Project stopped' } };
    },
  },
});
