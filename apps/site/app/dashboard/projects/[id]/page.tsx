import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Separator } from '@/components/ui/separator';
import { serverApi } from '@/serverApi';
import { format } from 'date-fns';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { IoMdArrowBack } from 'react-icons/io';
import { Description } from './_components/description';
import { DownloadData } from './_components/download-data';
import MainMenu from './_components/main-menu';
import { Results } from './_components/results';
import { SectionBox } from './_components/section-box';
import { Status } from './_components/status';
import { Title } from './_components/title';
import { getJobDates } from './helper';

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) {
    redirect('/');
  }

  const { status, body } = await serverApi.projects.get({
    headers: { authorization: `Bearer ${session.user.token}` },
    params: { id: params.id },
  });

  if (status === 401 || status === 404 || status === 500) {
    redirect('/dashboard/projects');
  }

  const project = body;

  const jobDates = await getJobDates({ session, projectId: project.id });

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-2">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/projects">
            <Button className="h-8 w-8" size="icon" variant="secondary">
              <IoMdArrowBack />
            </Button>
          </Link>
          <Title projectId={project.id} value={project.title} />
        </div>
        <MainMenu projectId={project.id} />
        <Separator className="my-2" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <SectionBox heading="Keywords">
          <div className="flex flex-col items-start gap-2">
            {project.keywords.map((keyword) => (
              <Pill key={keyword} className="text-sm">
                {keyword}
              </Pill>
            ))}
          </div>
        </SectionBox>
        <SectionBox heading="Crawler">
          <div className="flex flex-col items-start gap-1">
            <Pill value={project.crawlerConfig.seeds}>Seeds</Pill>
            <Pill value={project.crawlerConfig.branches}>Branches</Pill>
            <Pill value={project.crawlerConfig.depth}>Depth</Pill>
            {project.crawlerConfig.language && (
              <Pill value={project.crawlerConfig.language}>Language</Pill>
            )}
            {project.crawlerConfig.country && (
              <Pill value={project.crawlerConfig.country}>Country</Pill>
            )}
          </div>
        </SectionBox>
        <SectionBox heading="Schedule">
          <div className="flex flex-col items-start gap-1">
            <Pill value={project.schedule.frequency}>Frequency</Pill>
            {project.schedule.frequency === 'once' && (
              <Pill value={format(project.createdAt, 'dd-MM-yyyy')}>Date</Pill>
            )}
            <Pill value={project.schedule.time}>Time</Pill>
            {project.schedule.timezone && <Pill value={project.schedule.timezone}>Timezone</Pill>}
          </div>
        </SectionBox>
        <SectionBox heading="Status">
          <Status
            id={project.id}
            notification={project.preferences.notification}
            lastRunAt={jobDates?.lastRunAt}
            nextRunAt={jobDates?.nextRunAt}
            status={project.status}
          />
        </SectionBox>
      </div>
      <Description projectId={project.id} value={project.description} />
      <div>
        <div className="prose dark:prose-invert flex max-w-screen-xl flex-wrap items-center justify-between">
          <h3 className="mb-0">Results</h3>
          <DownloadData project={project} />
        </div>
        <Separator className="my-2" />
      </div>
      <Suspense fallback={<p>Loading...</p>}>
        <Results project={project} />
      </Suspense>
    </div>
  );
}
