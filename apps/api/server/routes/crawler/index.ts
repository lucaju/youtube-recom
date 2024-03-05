import { contract } from '@/contract';
import { ProjectDbModel } from '@/db/schemas';
import { CrawlerJobData, agenda } from '@/scheduler';
import { auth, bearerJWT } from '@/server/middleware/auth';
import { initServer } from '@ts-rest/express';
import { startOfToday } from 'date-fns';
import { scrapeVideo } from 'youtube-recommendation-crawler';
import * as actions from '../projects/_helper';

const s = initServer();

export const routerCrawler = s.router(contract.crawler, {
  video: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }
      const video = await scrapeVideo(params.id);
      return { status: 200, body: video };
    },
  },
  createCrawler: {
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

      //1.  Check if project already exists
      const existingProject = await ProjectDbModel.findOne({
        keywords: { $in: body.keywords },
        crawlerConfig: { $in: body.crawlerConfig },
        owner: currentUser.id,
        createdAt: { $gte: startOfToday() },
      });

      if (existingProject) {
        const existingJobs = await agenda.jobs({ name: 'crawler' });
        const existingJob = existingJobs.find((job) => {
          const data = job.attrs.data as CrawlerJobData;
          return data.projectId === existingProject.id;
        });

        if (existingJob) {
          const isRunning = await existingJob.isRunning();
          if (isRunning) {
            return {
              status: 200,
              body: {
                crawlerId: existingProject.id,
                message: 'Similar Crawler Requested Today: running',
              },
            };
          }

          if (!existingJob.attrs.lastFinishedAt) {
            return {
              status: 200,
              body: {
                crawlerId: existingProject.id,
                message: 'Similar Crawler Requested Today: queued',
              },
            };
          }
        }

        if (existingProject.results) {
          return {
            status: 200,
            body: {
              crawlerId: existingProject.id,
              message: 'Similar Crawler Requested Today',
              results: existingProject.results,
            },
          };
        }
      }

      //2. Create project
      const project = await actions.createProject(currentUser.id, { ...body, ephemeral: true });

      const jobs = await agenda.jobs({ name: 'crawler' });
      const job = jobs.find((job) => {
        const data = job.attrs.data as CrawlerJobData;
        return data.projectId === project.id;
      });

      const isRunning = await job?.isRunning();

      return {
        status: 201,
        body: { crawlerId: project.id, message: `Crawler ${isRunning ? 'started' : 'queued'}` },
      };
    },
  },
  getCrawlerResult: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const owner = currentUser.role === 'admin' ? undefined : currentUser.id;

      const project = await ProjectDbModel.findOne({
        _id: params.id,
        ...(owner ? { owner } : {}),
      });
      if (!project) {
        return { status: 404, body: { message: 'Crawler not found' } };
      }

      const jobs = await agenda.jobs({ name: 'crawler' });
      const job = jobs.find((job) => {
        const data = job.attrs.data as CrawlerJobData;
        return data.projectId === project.id;
      });
      if (!job) {
        return { status: 404, body: { message: 'Crawler not found' } };
      }

      const isRunning = await job.isRunning();

      if (isRunning) {
        return { status: 200, body: { message: 'Crawler running' } };
      }

      if (!job.attrs.lastFinishedAt) {
        return { status: 200, body: { message: 'Crawler queued' } };
      }

      if (!project.results) {
        return { status: 200, body: [] };
      }

      return { status: 200, body: project.results };
    },
  },
});
