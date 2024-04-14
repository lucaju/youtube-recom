import { contract } from '@/contract';
import { ProjectDbModel } from '@/db/projects/models';
import { auth, bearerJWT } from '@/server/middleware/auth';
import type { Project } from '@/types';
import { log } from '@/util/log';
import { initServer } from '@ts-rest/express';
import * as actions from './_helper';
import { routerAllProjects } from './all';
import { routerProjectsJobs } from './jobs';
import { routerProjectsResults } from './results';

const s = initServer();

export const routerProjects = s.router(contract.projects, {
  all: routerAllProjects,
  results: routerProjectsResults,
  jobs: routerProjectsJobs,
  getAll: {
    middleware: [auth('bearerJWT')],
    handler: async ({ query, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const filters: Partial<Pick<Project, 'ownerId' | 'status' | 'ephemeral'>> = {
        ownerId: currentUser.id,
        status: query.status,
      };
      if (query?.ephemeral) filters.ephemeral = query.ephemeral === 'true' ? true : false;

      const projects = await ProjectDbModel.find()
        .select(['-results', '-preferences'])
        .populate('owner', ['id', 'name']);

      return { status: 200, body: projects.reverse() };
    },
  },
  get: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, query, req: { currentUser } }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const includeResults = !query.results ? undefined : query.results === 'true' ? true : false;

      const project = await ProjectDbModel.findById(params.id).select(
        includeResults ? '' : '-results',
      );

      if (!project) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      return { status: 200, body: project };
    },
  },
  create: {
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
  update: {
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
      if (!currentUser || currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const updatedProject = await actions.updateProject(params.id, body);

      if (!updatedProject) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      return { status: 200, body: updatedProject };
    },
  },
  delete: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const deletedProject = await actions.deleteProject(params.id);

      if (!deletedProject) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      return { status: 200, body: { message: 'Project removed' } };
    },
  },
  activate: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const project = await actions.activateProject(params.id);

      if (!project) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      log.warn(`Project ${project.id} activated`);

      return { status: 200, body: { message: 'Project activated' } };
    },
  },
  deactivate: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const project = await actions.deactivateProject(params.id);

      if (!project) {
        return { status: 404, body: { message: 'Project not found' } };
      }

      log.warn(`Project ${project.id} deactivated`);

      return { status: 200, body: { message: 'Project deactivated' } };
    },
  },
});
