import { CrawlerJobData, agenda } from '@/scheduler';
import * as notitication from '@/server/notification';
import type { Project, User } from '@/types';
import type { Job } from '@whisthub/agenda';
import { isSameDay, isSameMonth, isSameWeek } from 'date-fns';
import { Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import { type CrawlerResult } from 'youtube-recommendation-crawler/schema';
import type { ProjectModel } from '../models';
import { CrawlerConfigDbSchema } from './crawler';
import { ProjectPreferencesDbSchema } from './preferences';
import { ProjectResultDbSchema } from './results';
import { ProjectScheduleDbSchema } from './schedule';

export interface ProjectMethods {
  getCrawlerJob(): Promise<Job | undefined>;
  hasBeenCollectedOnTimeframe(keyword: string): Promise<boolean>;
  isScheduled(keyword: string): Promise<boolean>;
  notify(results: CrawlerResult | CrawlerResult[]): Promise<void>;
  saveCollection(results: CrawlerResult | CrawlerResult[]): Promise<void>;
}

export const ProjectDbSchema = new Schema<Project, ProjectModel, ProjectMethods>(
  {
    ownerId: { type: String, required: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    keywords: { type: [{ type: String, minLength: 3 }], min: 1, required: true },
    crawlerConfig: { type: CrawlerConfigDbSchema, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    ephemeral: { type: Boolean, default: true },
    schedule: { type: ProjectScheduleDbSchema, required: true },
    preferences: { type: ProjectPreferencesDbSchema, required: true },
    results: [ProjectResultDbSchema],
  },
  {
    timestamps: true,
  },
);

ProjectDbSchema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  // justOne: true,
});

ProjectDbSchema.methods.toJSON = function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const project = this;
  const projectObject = project.toObject({ virtuals: true }) as typeof project & { _id: string };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
  const { _id, __v, ...publicData } = projectObject;

  const _project = Object.assign({ id: projectObject._id }, publicData);

  return _project;
};

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

  const jobs = await agenda.jobs({ name: 'crawler', data: { projectId: project._id, keyword } });

  const { frequency } = project.schedule;
  let collected = false;

  for (const job of jobs) {
    const { lastFinishedAt } = job.attrs;
    const isRunnig = await job.isRunning();

    if (!lastFinishedAt) {
      collected = isRunnig ? true : false;
      break;
    }

    if (frequency === 'once') {
      collected = true;
      break;
    }

    if (frequency === 'daily') {
      collected = isSameDay(lastFinishedAt, new Date());
      break;
    }

    if (frequency === 'weekly') {
      collected = isSameWeek(lastFinishedAt, new Date());
      break;
    }

    if (frequency === 'monthly') {
      collected = isSameMonth(lastFinishedAt, new Date());
      break;
    }
  }

  return collected;
};

ProjectDbSchema.methods.isScheduled = async function (keyword: string) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const project = this;
  const jobs = await agenda.jobs({ name: 'crawler', data: { projectId: project._id, keyword } });
  return !!jobs;
};

ProjectDbSchema.methods.saveCollection = async function (results: CrawlerResult | CrawlerResult[]) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const project = this;

  const data = Array.isArray(results) ? results : [results];

  //add ids
  const dataWithId = data.map((result) => {
    return { ...result, id: nanoid() };
  });

  project.results = project.results ? [...project.results, ...dataWithId] : dataWithId;
  await project.save();
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
      await notitication.discord.sendToDiscord(project.title ?? project._id.toString(), result);
    }
  }
};
