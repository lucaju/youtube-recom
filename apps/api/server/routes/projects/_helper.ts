import { UserDbModel, type Project } from '@/db/schemas';
import { ProjectDbModel } from '@/db/schemas/projects';
import { ProjectPreferences } from '@/db/schemas/projects/preferences';
import { ProjectSchedule, getCronByFrequency } from '@/db/schemas/projects/schedule';
import { agenda } from '@/scheduler';
import { Types } from 'mongoose';
import { CrawlerConfig } from 'youtube-recommendation-crawler';

export const getProject = async (id: string, owner?: Project['owner']) => {
  const project = await ProjectDbModel.findOne({
    _id: new Types.ObjectId(id),
    ...(owner ? { owner: new Types.ObjectId(owner) } : {}),
  }).select('-results');

  return project;
};

export const createProject = async (
  userId: string,
  configProject: Pick<Project, 'title' | 'keywords' | 'crawlerConfig' | 'ephemeral'> & {
    preference?: Partial<ProjectPreferences>;
    schedule?: Pick<ProjectSchedule, 'time' | 'frequency' | 'timezone'>;
  },
) => {
  const { crawlerConfig, keywords, ephemeral, title } = configProject;
  const schedule = configProject.schedule ?? { frequency: 'once' };
  const preferences = configProject.preference ?? {};

  const project = new ProjectDbModel({
    owner: new Types.ObjectId(userId),
    title,
    keywords,
    crawlerConfig,
    schedule,
    preferences,
    ephemeral,
    status: { running: false, scheduled: false },
  });

  const user = await UserDbModel.findById(userId);

  //* add job
  for (const keyword of keywords) {
    const job = await createJob({ projectId: project.id, keyword, crawlerConfig, schedule });

    //Single Crawler (no project title)
    if (!ephemeral) await job.priority('lowest').save();

    //* admin priority
    if (user?.role === 'admin') await job.priority('highest').save();
  }

  await project.save();

  return project;
};

export const updateProject = async (
  { id, owner }: { id: Project['id']; owner?: Project['owner'] },
  { title }: Pick<Project, 'title'>,
) => {
  const project = await ProjectDbModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(id),
      ...(owner ? { owner: new Types.ObjectId(owner) } : {}),
    },
    { title },
    { new: true },
  );
  return project;
};

export const deleteProject = async (id: string, owner?: Project['owner']) => {
  const project = await ProjectDbModel.findOne({
    _id: new Types.ObjectId(id),
    ...(owner ? { owner: new Types.ObjectId(owner) } : {}),
  }).select(['id, title']);

  if (!project) return;

  //* Stop and delete all jobs related to this project
  const jobs = await agenda.jobs({ name: 'crawler', data: { projectId: project.id } });

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
    .create('crawler', {
      projectId,
      keyword,
      crawlerConfig,
    })
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

export const startJob = async (id: string, owner?: Project['owner']) => {
  const project = await ProjectDbModel.exists({
    _id: new Types.ObjectId(id),
    ...(owner ? { owner: new Types.ObjectId(owner) } : {}),
  }).select(['id', 'title']);

  if (!project) return;

  //* Stop and delete all jobs related to this project
  const jobs = await agenda.jobs({ name: 'crawler', data: { projectId: project._id } });

  for (const job of jobs) {
    await job.enable().remove();
  }

  return project;
};

export const stopJob = async (id: string, owner?: Project['owner']) => {
  const project = await ProjectDbModel.exists({
    _id: new Types.ObjectId(id),
    ...(owner ? { owner: new Types.ObjectId(owner) } : {}),
  }).select(['id', 'title']);

  if (!project) return;

  const jobs = await agenda.jobs({ name: 'crawler', data: { projectId: project._id } });

  for (const job of jobs) {
    await job.disable().save();
  }

  return project;
};
