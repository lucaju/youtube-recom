import { CrawlerJobData, agenda } from '@/scheduler';
import * as notitication from '@/server/notification';
import { Job } from '@whisthub/agenda';
import { isSameDay, isSameMonth, isSameWeek } from 'date-fns';
import fs from 'fs-extra';
import mongoose, { Model, Schema, model } from 'mongoose';
import {
  crawlerConfigSchema,
  crawlerResultSchema,
  type CrawlerResult,
} from 'youtube-recommendation-crawler';
import { z } from 'zod';
import { CrawlerConfigDbSchema, CrawlerResultDbSchema } from '../shared';
import type { User } from '../users';
import { ProjectPreferencesDbSchema, projectPreferencesSchema } from './preferences';
import { ProjectScheduleDbSchema, projectScheduleSchema } from './schedule';

export const projectSchema = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val)),
  owner: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val)),
  title: z.string().optional(),
  keywords: z.array(z.string().min(3)).min(1),
  crawlerConfig: crawlerConfigSchema,
  active: z.boolean().default(true),
  ephemeral: z.boolean().default(false).optional(),
  schedule: projectScheduleSchema,
  preferences: projectPreferencesSchema,
  results: z.array(crawlerResultSchema).optional(),
});
export type Project = z.infer<typeof projectSchema>;

export interface ProjectMethods {
  getCrawlerJob(): Promise<Job | undefined>;
  hasBeenCollectedOnTimeframe(keyword: string): Promise<boolean>;
  isScheduled(keyword: string): Promise<boolean>;
  notify(results: CrawlerResult | CrawlerResult[]): Promise<void>;
  saveCollection(results: CrawlerResult | CrawlerResult[]): Promise<void>;
  saveCollectionToFile(results: CrawlerResult): Promise<void>;
}

export type ProjectModel = Model<Project, Record<string, never>, ProjectMethods>;

export const ProjectDbSchema = new Schema<Project, ProjectModel, ProjectMethods>(
  {
    owner: { type: String, ref: 'User', required: true },
    title: { type: String, trim: true },
    keywords: { type: [{ type: String, minLength: 3 }], min: 1, required: true },
    crawlerConfig: { type: CrawlerConfigDbSchema, required: true },
    active: { type: Boolean, default: true },
    ephemeral: { type: Boolean, default: true },
    schedule: { type: ProjectScheduleDbSchema, required: true },
    preferences: { type: ProjectPreferencesDbSchema, required: true },
    results: [CrawlerResultDbSchema],
  },
  { timestamps: true },
);

ProjectDbSchema.methods.getCrawlerJob = async function () {
  const project = this as Project & ProjectMethods;

  const jobs = await agenda.jobs({ name: 'crawler', data: { projectId: project.id } });
  const job = jobs.find((job) => {
    const data = job.attrs.data as CrawlerJobData;
    return data.projectId === project.id;
  });

  return job;
};
ProjectDbSchema.methods.hasBeenCollectedOnTimeframe = async function (keyword: string) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const project = this;

  const jobs = await agenda.jobs({ name: 'crawler', data: { projectId: project.id, keyword } });

  let collected = false;

  for (const job of jobs) {
    const { lastFinishedAt } = job.attrs;
    const isRunnig = await job.isRunning();

    if (!lastFinishedAt) {
      collected = isRunnig ? true : false;
      break;
    }

    if (project.schedule.frequency === 'once') {
      collected = true;
      break;
    }

    if (project.schedule.frequency === 'daily') {
      collected = isSameDay(lastFinishedAt, new Date());
      break;
    }

    if (project.schedule.frequency === 'weekly') {
      collected = isSameWeek(lastFinishedAt, new Date());
      break;
    }

    if (project.schedule.frequency === 'monthly') {
      collected = isSameMonth(lastFinishedAt, new Date());
      break;
    }
  }

  return collected;
};

ProjectDbSchema.methods.isScheduled = async function (keyword: string) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const project = this;
  const jobs = await agenda.jobs({ name: 'crawler', data: { projectId: project.id, keyword } });
  return !!jobs;
};

ProjectDbSchema.methods.saveCollection = async function (results: CrawlerResult | CrawlerResult[]) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const project = this;

  const data = Array.isArray(results) ? results : [results];

  project.results = project.results ? [...project.results, ...data] : data;
  await project.save();
};

ProjectDbSchema.methods.saveCollectionToFile = async function (results: CrawlerResult) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const project = this;
  const result = {
    projectId: project.id,
    title: project.title,
    date: new Date(),
    keywords: results.keyword,
    results,
  };

  const folder = 'results';
  const file = `${project.title}-${result.date.toDateString()}.json`;
  await fs.outputJson(`${folder}/${file}`, result, { spaces: 2 });
};

ProjectDbSchema.methods.notify = async function (results: CrawlerResult | CrawlerResult[]) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const project = this;

  const data = Array.isArray(results) ? results : [results];

  if (project.preferences.notification.email && project.title) {
    const { owner } = await project.populate<{ owner: User }>({
      path: 'owner',
      select: ['name', 'email'],
    });
    const body = notitication.email.composer({
      title: project.title,
      date: new Date(),
      results: data,
    });
    await notitication.email.sendEmail({ recipient: owner, body });
  }

  if (project.preferences.notification.discord) {
    for (const result of data) {
      await notitication.discord.sendToDiscord(project.title ?? project.id, result);
    }
  }
};

export const ProjectDbModel = model<Project, ProjectModel>('Project', ProjectDbSchema);
