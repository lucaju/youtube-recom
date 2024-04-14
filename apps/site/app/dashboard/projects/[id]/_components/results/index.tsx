import { auth } from '@/auth';
import { serverApi } from '@/serverApi';
import type { Project } from 'youtube-recommendation-crawler-api/types';
import { Result } from './result';

interface Props {
  project: Project;
}

export const Results = async ({ project }: Props) => {
  const session = await auth();
  if (!session) {
    return null;
  }

  const { status, body: results } = await serverApi.projects.results.getAll({
    headers: { authorization: `Bearer ${session.user.token}` },
    params: { id: project.id },
  });

  if (status === 401 || status === 404 || status === 500) {
    return null;
  }

  return (
    <div className="flext">
      {results?.map((result) => <Result key={result.id} project={project} result={result} />)}
    </div>
  );
};
