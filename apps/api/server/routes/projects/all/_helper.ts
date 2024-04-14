import { ProjectDbModel } from '@/db/projects/models';
import { agenda } from '@/scheduler';

export const stopAllJob = async () => {
  const jobs = await agenda.jobs({ name: 'crawler' });

  for (const job of jobs) {
    await job.disable().save();
  }

  await ProjectDbModel.updateMany({ statuts: 'active' }, { statuts: 'inactive' });
};
