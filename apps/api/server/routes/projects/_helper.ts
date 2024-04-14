import { ProjectDbModel } from '@/db/projects/models';
import { UserDbModel } from '@/db/users/models';
import { agenda } from '@/scheduler';
import type { Project, ProjectPreferences, ProjectSchedule, ScheduleFrequency } from '@/types';
import { getDate, getDay, getHours, getMinutes } from 'date-fns';
import { Types } from 'mongoose';
import { CrawlerConfig } from 'youtube-recommendation-crawler';

export const getProject = async (id: string) => {
  const project = await ProjectDbModel.findById(id).select('-results');
  return project;
};

export const createProject = async (
  userId: string,
  configProject: Pick<
    Project,
    'title' | 'description' | 'keywords' | 'crawlerConfig' | 'ephemeral'
  > & {
    preference?: Partial<ProjectPreferences>;
    schedule?: Pick<ProjectSchedule, 'time' | 'frequency' | 'timezone'>;
  },
) => {
  const { crawlerConfig, keywords, ephemeral, title, description } = configProject;
  const schedule = configProject.schedule ?? { frequency: 'once' };
  const preferences = configProject.preference ?? {};

  const project = new ProjectDbModel({
    ownerId: new Types.ObjectId(userId),
    description,
    title,
    keywords,
    crawlerConfig,
    schedule,
    preferences,
    ephemeral,
    status: 'active',
  });

  const user = await UserDbModel.findById(userId);

  //* add job
  for (const keyword of keywords) {
    const job = await createJob({
      projectId: project.id,
      keyword,
      crawlerConfig,
      schedule,
    });

    //Single Crawler (no project title)
    if (!ephemeral) await job.priority('lowest').save();

    //* admin priority
    if (user?.role === 'admin') await job.priority('highest').save();
  }

  await project.save();

  return project;
};

export const updateProject = async (
  id: Project['id'],
  { title, description, preferences }: Partial<Project>,
) => {
  const project = await ProjectDbModel.findByIdAndUpdate(
    id,
    { title, description, preferences },
    { new: true },
  );
  return project;
};

export const deleteProject = async (id: Project['id']) => {
  const project = await ProjectDbModel.findById(id).select(['id']);
  if (!project) return;

  //* Stop and delete all jobs related to this project
  const jobs = await agenda.jobs({ name: 'crawler', 'data.projectId': project.id });

  for (const job of jobs) {
    await job.disable().remove();
  }

  const deletedProject = await ProjectDbModel.findByIdAndDelete(project.id);

  return deletedProject;
};

const createJob = async ({
  projectId,
  keyword,
  crawlerConfig,
  schedule,
}: {
  projectId: Project['id'];
  keyword: string;
  crawlerConfig: CrawlerConfig;
  schedule?: ProjectSchedule;
}) => {
  const job = agenda
    .create('crawler', { projectId, keyword, crawlerConfig })
    .unique({ projectId: `${projectId}-${keyword}` });

  const inteval = schedule ? getCronByFrequency(schedule.frequency, schedule.time) : undefined;

  if (inteval) {
    job.repeatEvery(inteval, {
      skipImmediate: schedule?.time ? true : false,
      timezone: schedule?.timezone,
    });
  }

  await job.enable().save();
  return job;
};

export const activateProject = async (id: Project['id']) => {
  const project = await ProjectDbModel.findById(id).select(['id', 'title', 'status']);
  if (!project) return;

  //* Start all jobs related to this project
  const jobs = await agenda.jobs({ name: 'crawler', 'data.projectId': project.id });

  for (const job of jobs) {
    await job.enable().save();
  }

  await project.updateOne({ status: 'active' }, { new: true });

  return project;
};

export const deactivateProject = async (id: Project['id']) => {
  const project = await ProjectDbModel.findById(id).select(['id', 'title', 'status']);
  if (!project) return;

  //* Stop all jobs related to this project
  const jobs = await agenda.jobs({ name: 'crawler', 'data.projectId': project.id });

  for (const job of jobs) {
    job.disable();
    await job.save();
  }

  await project.updateOne({ status: 'inactive' }, { new: true });

  return project;
};

export const getCronByFrequency = (frequency: ScheduleFrequency, time: ProjectSchedule['time']) => {
  if (frequency === 'once') return;

  const now = new Date();

  let _time = time?.split(':');
  if (!_time) {
    _time = [getHours(now).toString(), getMinutes(now).toString()];
  }

  const [hour, minutes] = _time;

  if (frequency === 'daily') {
    return `${minutes} ${hour} * * *`;
  }

  if (frequency === 'weekly') {
    return `${minutes} ${hour} * * ${getDay(now)}`;
  }

  if (frequency === 'monthly') {
    return `${minutes} ${hour} ${getDate(now)} * *`;
  }
};
