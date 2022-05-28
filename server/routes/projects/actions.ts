import { Job } from 'agenda';
import { Document, Types } from 'mongoose';
import { IProject } from '../../../db';
import { ProjectModel } from '../../../db/projects';
import { RecommendationModel } from '../../../db/recommendations';
import { agenda } from '../../../jobs/agenda';
import { CrawlJobData } from '../../../jobs/crawler';

export interface IActionsParams {
  dispose?: boolean;
  active?: boolean;
  owner?: string;
  project?: IProject;
}

export interface IActionsParamsSpecific extends IActionsParams {
  id: string;
}

// export const sanitizeMongoConditions = <T>(request: T) => {
//   const sanitized = Object.entries(request).filter(([, value]) => value !== undefined);
//   if (sanitized.length === 0) return;
//   return Object.fromEntries(sanitized);
// };

export const createProject = async (userId: string, configProject: Partial<IProject>) => {
  const { crawler, schedule, title } = configProject;
  if (!crawler || !schedule || !title) return;

  const project = await ProjectModel.create({
    crawler,
    owner: userId,
    schedule,
    status: { running: false, scheduled: false },
    title,
  });

  //add job
  const job = constructeJob(project);
  await job.save();

  project.job = job;

  project.status = {
    scheduled: true,
    running: job.isRunning(),
    lastDate: job.attrs.lastFinishedAt,
    nextDate: job.attrs.nextRunAt ?? undefined,
  };

  return project;
};

export const updateProject = async (request: IActionsParamsSpecific) => {
  const { id, owner, project: updateProject } = request;
  if (!updateProject) return { error: 'Invalid updates!' };

  // check valid operation
  const updates = Object.keys(updateProject);
  const allowedUpdates = ['title'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  const configUpdate = allowedUpdates.find((type) => type === 'config');

  if (!isValidOperation) return { error: 'Invalid updates!' };

  const _id = new Types.ObjectId(id);
  const ownerId = new Types.ObjectId(owner);

  const project = await ProjectModel.findOne({ _id, owner: ownerId });
  if (!project) return;

  //@ts-ignore
  updates.forEach((update) => (project[update] = updateProject[update]));

  await project.save();

  if (configUpdate) {
    await stopJob({ id, owner, dispose: true });
    await startJob({ id, owner });
  }

  return project;
};

export const getProjects = async (request: IActionsParams = {}) => {
  const projects = await ProjectModel.find(request);

  for (const project of projects) {
    const jobs = await agenda.jobs({ name: 'crawl' });
    const job = jobs.find((job: Job<CrawlJobData>) => job.attrs.data?.projectId === project.id);
    if (!job) continue;
    project.job = job;
  }

  return projects;
};

export const getProject = async ({ id, owner }: IActionsParamsSpecific) => {
  const ownerId = new Types.ObjectId(owner);
  const project = await ProjectModel.findById(id);
  if (!project) return;
  if (owner) {
    if (project.owner !== ownerId || (project.owner !== ownerId && project.active === true)) {
      return;
    }
  }

  const jobs = await agenda.jobs({ name: 'crawl' });
  const job = jobs.find((job: Job<CrawlJobData>) => job.attrs.data?.projectId === project.id);
  if (job) project.job = job;

  return project;
};

const constructeJob = (project: Document<unknown, any, IProject> & IProject) => {
  const { crawler, id, schedule } = project;
  const { frequency, timezone, atTime } = schedule;

  let inteval: string = frequency;

  //* if 'atTime' is defined, then we need to pass interval as cron time for more granulatity
  if (atTime) {
    // eslint-disable-next-line prefer-const
    let [hour, minutes] = atTime.split(':');
    if (hour.length === 1) hour = `0${hour}`;
    inteval = `${minutes} ${hour} * * *`;
  }

  const job = agenda
    .create('crawl', {
      projectId: id,
      crawlerConfig: crawler,
    })
    .repeatEvery(inteval, {
      skipImmediate: atTime ? true : false,
      timezone,
    })
    .unique({ projectId: id });

  return job;
};

export const startJob = async ({ id, owner }: IActionsParamsSpecific) => {
  const ownerId = new Types.ObjectId(owner);
  const project = await ProjectModel.findById(id);
  if (!project || (owner && project.owner !== ownerId)) return;

  const jobs = await agenda.jobs({ name: 'crawl' });
  let job = jobs.find((job: Job<CrawlJobData>) => job.attrs.data?.projectId === project.id);

  job ? job.enable() : (job = constructeJob(project));

  await job.save();

  project.job = job;

  project.status = {
    scheduled: true,
    running: job.isRunning(),
    lastDate: job.attrs.lastFinishedAt,
    nextDate: job.attrs.nextRunAt ?? undefined,
  };

  await project.save();

  return project;
};

export const stopJob = async ({ dispose = false, id, owner }: IActionsParamsSpecific) => {
  const ownerId = new Types.ObjectId(owner);
  const project = await ProjectModel.findById(id);
  if (!project || (owner && project.owner !== ownerId)) return;

  const jobs = await agenda.jobs({ name: 'crawl' });
  const job = jobs.find((job: Job<CrawlJobData>) => job.attrs.data?.projectId === project.id);
  if (!job) if (!job) return { error: `Project ${project.id} was not scheduled` };

  project.status = {
    scheduled: false,
    running: false,
    lastDate: job.attrs.lastRunAt,
  };

  dispose ? await job.remove() : await job.disable().save();

  await project.save();

  if (!dispose) project.job = job;

  return project;
};

export const stopAllJob = async ({ dispose = false }: IActionsParams) => {
  const jobs = await agenda.jobs({ name: 'crawl' });

  for (const job of jobs) {
    dispose ? await job.remove() : await job.disable().save();

    await ProjectModel.findOneAndUpdate(
      { ative: true, 'status.scheduled': true },
      {
        status: {
          scheduled: false,
          running: false,
          lastDate: job.attrs.lastRunAt,
        },
      }
    );
  }
};

export const deleteProject = async ({ dispose = false, id, owner }: IActionsParamsSpecific) => {
  const ownerId = new Types.ObjectId(owner);
  const project = await ProjectModel.findById(id);
  if (!project || (owner && project.owner !== ownerId)) return;

  const jobs = await agenda.jobs({ name: 'crawl' });
  const job = jobs.find((job: Job<CrawlJobData>) => job.attrs.data?.projectId === project.id);
  if (job) await job.remove();

  if (dispose) {
    // remove completly
    await RecommendationModel.deleteMany({ project: project.id });
    await project.remove();
    return project.id;
  }

  //update - change active to false
  project.active = false;
  project.status = {
    scheduled: false,
    running: false,
    lastDate: job?.attrs.lastRunAt,
  };

  await project.save();

  return project.id;
};

export default {
  createProject,
  getProjects,
  getProject,
  startProject: startJob,
  stopProject: stopJob,
  stopAllProjects: stopAllJob,
  deleteProject,
};
