import { serverApi } from '@/serverApi';
import { authOptions } from '@/app/api/auth/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TypographyH3 } from '@/components/ui/typography';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { IoMdAdd } from 'react-icons/io';
import { DataTable } from './_components/datatable';
import { columns } from './_components/datatable/columns';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }

  const { status, body } = await serverApi.projects.getAll({
    headers: { authorization: `Bearer ${session.user.token}` },
  });

  const projects = status === 200 ? body : [];

  return (
    <div className="mx-auto max-w-screen-xl flex-wrap items-center justify-between px-4 py-2">
      <div className="flex items-center space-x-4">
        <TypographyH3>Projects</TypographyH3>
        <Link href="/dashboard/projects/new">
          <Button className="h-8 w-8" size="icon" variant="secondary">
            <IoMdAdd />
          </Button>
        </Link>
      </div>
      <Separator className="my-2" />
      {projects && <DataTable columns={columns} data={projects} userRole={session.user.role} />}
    </div>
  );
}
