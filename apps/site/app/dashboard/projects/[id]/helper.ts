import { serverApi } from '@/serverApi';
import { isAfter } from 'date-fns';
import { Session } from 'next-auth';
import { Project } from 'youtube-recommendation-crawler-api/types';

interface Props {
  session: Session;
  projectId: Project['id'];
}

export const getJobDates = async ({ session, projectId }: Props) => {
  const { status, body } = await serverApi.projects.jobs.getAll({
    headers: { authorization: `Bearer ${session.user.token}` },
    params: { id: projectId },
  });

  if (status === 401 || status === 404 || status === 500) {
    return null;
  }

  const jobs = body;

  const lastRunAt = jobs.reduce((mostRecent: Date | null, job) => {
    if (!job.lastRunAt) return null;
    const recent = isAfter(job.lastRunAt, mostRecent || new Date(0))
      ? new Date(job.lastRunAt)
      : (mostRecent as Date);

    return recent;
  }, null);

  const nextRunAt = jobs[0].nextRunAt;

  return { lastRunAt, nextRunAt };
};
