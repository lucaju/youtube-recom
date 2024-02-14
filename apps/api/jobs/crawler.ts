import { Agenda, Job } from 'agenda';
import { crawler, type ICrawlerConfig } from 'youtube-recommendation-crawler';
import type { IProjectStatus } from '@/db';
import { ProjectModel } from '@/db/projects';
import log from 'loglevel';

export interface CrawlJobData {
  projectId?: string;
  crawlerConfig?: ICrawlerConfig;
}

export const DefineCrawlerJob = (agenda: Agenda) => {
  agenda.define('crawl', async (job: Job<CrawlJobData>) => {
    const { projectId, crawlerConfig } = job.attrs.data ?? {};
    if (!projectId || !crawlerConfig) return;

    const project = await ProjectModel.findById(projectId);
    if (!project) return;

    if (project.schedule.frequency === 'day' && project.hasBeenCollectedToday()) {
      return;
    }

    const data = await crawler(crawlerConfig);

    await project.saveCollection(data);
    await project.notify(data);
  });

  agenda.on('start:crawl', async (job: Job<CrawlJobData>) => {
    log.info(`Job ${job.attrs.name} start`);

    const { projectId } = job.attrs.data ?? {};
    if (!projectId) return;

    const project = await ProjectModel.findById(projectId);
    if (!project) return;

    if (project.status.running) return;

    project.status.running = true;

    await project.save();
  });

  agenda.on('complete:crawl', async (job: Job<CrawlJobData>) => {
    log.info(`Job ${job.attrs.name} finished`);

    const { projectId } = job.attrs.data ?? {};
    if (!projectId) return;

    const project = await ProjectModel.findById(projectId);
    if (!project) return;

    if (!project.status.running) return;

    const status: IProjectStatus = Object.assign(project.status, {
      running: false,
      lastDate: job.attrs.lastFinishedAt,
      nextDate: job.attrs.nextRunAt,
    });

    project.status = status;

    await project.save();
  });
};
