import fs from 'fs-extra';
import { DateTime } from 'luxon';
import { Document, Model, model } from 'mongoose';
import type { IProject } from '..';
import { ICrawlerResult } from '../../crawler';
import { RecommendationModel } from '../recommendations';
import { IUser } from '../types';
import { composer, sendEmail } from './notification';
import { ProjectSchema } from './schema';

export interface IProjectMethods {
  hasBeenCollectedToday(): boolean;
  notify(results: ICrawlerResult[]): Promise<void>;
  saveCollection(results: ICrawlerResult[]): Promise<void>;
  saveCollectionToFile(results: ICrawlerResult[]): Promise<void>;
}

export type IProjectModel = Model<IProject, Record<string, never>, IProjectMethods>;

ProjectSchema.methods.hasBeenCollectedToday = function () {
  const project = this as IProject & IProjectMethods;

  if (project.schedule.frequency !== 'day') return false;

  const { lastDate } = project.status;
  if (!lastDate) return false;

  const collectedToday = DateTime.fromJSDate(lastDate).hasSame(DateTime.local(), 'day');
  return collectedToday;
};

ProjectSchema.methods.notify = async function (results: ICrawlerResult[]) {
  const project = this as Document<unknown, any, IProject> & IProject & IProjectMethods;
  const { owner } = await project.populate<{ owner: IUser }>({
    path: 'owner',
    select: ['name', 'email'],
  });

  const body = composer({
    title: project.title,
    date: DateTime.now(),
    results,
  });

  await sendEmail({ recipient: owner, body });
};

ProjectSchema.methods.saveCollection = async function (results: ICrawlerResult[]) {
  const project = this as Document<unknown, any, IProject> & IProject & IProjectMethods;

  for (const result of results) {
    const { keyword, date, videos } = result;

    if (project.schedule.frequency === 'day') {
      const isRecommendedToday = await RecommendationModel.collectedKeywordAt(project.id, date);
      if (isRecommendedToday) return;
    }
    await RecommendationModel.create({ project: project.id, date: date.toBSON(), keyword, videos });
  }
};

ProjectSchema.methods.saveCollectionToFile = async function (results: ICrawlerResult[]) {
  const project = this as Document<unknown, any, IProject> & IProject & IProjectMethods;

  const keywords = results.map(({ keyword }) => keyword);
  const data = results.map(({ keyword, date, videos }) => ({
    keyword,
    date: date.toISO(),
    videos,
  }));

  const result = {
    projectId: project.id,
    title: project.title,
    date: new Date(),
    keywords,
    results: data,
  };

  const folder = 'results';
  const file = `${project.title}-${result.date}.json`;
  await fs.outputJson(`${folder}/${file}`, result, { spaces: 2 });
};

ProjectSchema.methods.toJSON = function () {
  const project = this as Document<unknown, any, IProject> & IProject & IProjectMethods;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { job, ...projectObject } = project.toObject();

  return {
    ...projectObject,
    job: job?.toJSON(),
  };
};

export const ProjectModel = model<IProject, IProjectModel>('Project', ProjectSchema);
