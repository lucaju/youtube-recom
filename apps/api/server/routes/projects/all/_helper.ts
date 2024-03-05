import { ProjectDbModel } from '@/db/schemas/projects';
import { agenda } from '@/scheduler';

export const stopAllJob = async () => {
  const jobs = await agenda.jobs({ name: 'crawler' });

  for (const job of jobs) {
    await job.disable().save();

    await ProjectDbModel.findOneAndUpdate(
      { ative: true, 'status.scheduled': true },
      {
        status: {
          scheduled: false,
          running: false,
          lastDate: job.attrs.lastRunAt,
        },
      },
    );
  }
};
