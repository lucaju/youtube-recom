import Job from '.';
import { IJobConfig } from './types';

const MAX_ACTIVE_JOBS = 3;
let jobPool: Job[] = [];

export const hasActiveSlot = jobPool.filter((job) => job.active).length < MAX_ACTIVE_JOBS;

const createJob = (id: string, config: IJobConfig) => {
  const existingJob = getJob(id);
  if (existingJob) return existingJob;

  const job = new Job(id, config);
  jobPool = [...jobPool, job];

  return job;
};

export const getJobs = () => [...jobPool];

export const getJob = (id: string) => {
  const job = jobPool.find((job) => job.id == id);
  return job;
};

export const removeJob = (id: string) => {
  const job = getJob(id);
  if (!job) return;
  jobPool = jobPool.filter((job) => job.id != id);
};

export const reset = () => (jobPool = []);

export default {
  MAX_ACTIVE_JOBS,
  hasActiveSlot,
  createJob,
  getJobs,
  getJob,
  removeJob,
  reset,
};
