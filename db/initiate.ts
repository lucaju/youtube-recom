import { blue } from 'kleur';
import log from 'loglevel';
import JobPool from '../job/pool';
import { install } from './install';
import { ProjectModel, UserModel } from './models';

export const initiate = async () => {
  const ready = await checkUserAdmin();
  if (!ready) await install();
  await rehydrate();
};

const rehydrate = async () => {
  //restart active projects
  const activeProjects = await ProjectModel.find({ 'status.scheduled': true });
  if (activeProjects.length === 0) return;

  activeProjects.forEach((project) => {
    const { crawler, schedule, storage, title } = project;
    const job = JobPool.createJob(project.id, { crawler, schedule, storage, title });
    job.start();
  });

  log.info(blue(`${activeProjects.length} Jobs reactivated`));
};

const checkUserAdmin = async () => {
  let installed = true;

  //check if admin user exists
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw Error('Check installation Failed. Missing admin credentials');

  await UserModel.findByEmail(adminEmail).catch(() => (installed = false));

  return installed;
};
