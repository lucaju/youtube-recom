import { IProject } from '../../../db';
import { ProjectModel } from '../../../db/models';
import type { IJobCronEvent, IStorage } from '../../../job';
import JobPool from '../../../job/pool';

export const sanitizeMongoConditions = <T>(request: T) => {
  const sanitized = Object.entries(request).filter(([, value]) => value !== undefined);
  if (sanitized.length === 0) return;
  return Object.fromEntries(sanitized);
};

export const createProject = async (userId: string, configProject: Partial<IProject>) => {
  const { crawler, schedule, title } = configProject;
  if (!crawler || !schedule || !title) return;

  const storage: IStorage = { useDB: true };

  const project = await ProjectModel.create({
    crawler,
    owner: userId,
    schedule,
    status: { running: false, scheduled: false },
    storage: { useDB: true },
    title,
  });

  const job = JobPool.createJob(project.id, { crawler, schedule, storage, title });

  project.job = job;

  return project;
};

export const getProjects = async (request: { active?: boolean; owner?: string } = {}) => {
  const projects = (await ProjectModel.find(request)).map((project) => {
    project.job = JobPool.getJob(project.id);
    return project;
  });

  return projects;
};

export const getProject = async (request: { id: string; owner?: string }) => {
  const sanitizedRequest = sanitizeMongoConditions(request);
  if (!sanitizedRequest) return;

  const project = await ProjectModel.findOne({ sanitizedRequest });
  if (!project) return;

  project.job = JobPool.getJob(request.id);

  return project;
};

export const startJob = async (request: { id: string; owner?: string }) => {
  const sanitizedRequest = sanitizeMongoConditions(request);
  if (!sanitizedRequest) return;

  const project = await ProjectModel.findOne(sanitizedRequest);
  if (!project) return;

  if (!JobPool.hasActiveSlot) {
    return {
      error: `CronJob is limited to [${JobPool.MAX_ACTIVE_JOBS}]. Stop a job before starting another.`,
    };
  }

  const { crawler, schedule, storage, title } = project;

  const job =
    JobPool.getJob(project.id) ??
    JobPool.createJob(project.id, { crawler, schedule, storage, title });

  project.job = job;
  project.job.start();

  project.status = {
    scheduled: true,
    running: false,
    lastDate: job.status.lastDate,
    nextDate: job.status.nextDates.toJSDate(),
  };

  await project.save();

  project.job.on('job:cron:tick', async (event: IJobCronEvent) => {
    if (project.status.running) return;

    const status = Object.assign(project.status, event.status);
    project.status = status;

    await project.save();
  });

  project.job.on('job:cron:completed', async (event: IJobCronEvent) => {
    if (!project.status.running) return;

    const status = Object.assign(project.status, event.status);
    project.status = status;

    await project.save();
  });

  return project;
};

export const stopJob = async ({
  dispose = false,
  id,
  owner,
}: {
  dispose?: boolean;
  id: string;
  owner?: string;
}) => {
  const sanitizedRequest = sanitizeMongoConditions({ id, owner });
  if (!sanitizedRequest) return;

  const project = await ProjectModel.findOne(sanitizedRequest);
  if (!project) return;

  const job = JobPool.getJob(id);
  if (!job) return { error: `Project ${project.id} was not scheduled` };

  dispose ? job.dispose() : job.stop();

  project.status = {
    scheduled: false,
    running: false,
    lastDate: job.status.lastDate,
  };

  await project.save();

  if (!dispose) project.job = job;

  return project;
};

export const stopAllJob = async ({ dispose = false }: { dispose?: boolean }) => {
  JobPool.getJobs().forEach((job) => (dispose ? job.dispose() : job.stop()));

  for (const job of JobPool.getJobs()) {
    dispose ? job.dispose() : job.stop();

    await ProjectModel.findOneAndUpdate(
      { 'status.scheduled': true },
      {
        status: {
          scheduled: false,
          running: false,
          lastDate: job.status.lastDate,
        },
      }
    );
  }

  if (dispose) JobPool.reset();
};

export const deleteProject = async (request: { id: string; owner?: string }) => {
  const sanitizedRequest = sanitizeMongoConditions(request);
  if (!sanitizedRequest) return;

  const project = await ProjectModel.findOneAndRemove(sanitizedRequest);
  if (!project) return;

  JobPool.getJob(request.id)?.dispose();

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
