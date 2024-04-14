import { authOptions } from '@/app/api/auth/auth';
import { Separator } from '@/components/ui/separator';
import { TypographyH3 } from '@/components/ui/typography';
import { serverApi } from '@/serverApi';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { AddUser } from './_components/add-user';
import { DataTable } from './_components/datatable';
import { columns } from './_components/datatable/columns';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }

  const { status, body } = await serverApi.users.getAll({
    headers: { authorization: `Bearer ${session.user.token}` },
  });

  if (status === 401 || status === 500) {
    return <h1>Not found</h1>;
  }

  const users = body;

  return (
    <div className="mx-auto max-w-screen-xl flex-wrap items-center justify-between px-4 py-2">
      <div className="flex items-center space-x-4">
        <TypographyH3>Users</TypographyH3>
        <AddUser />
      </div>
      <Separator className="my-2" />
      {users && <DataTable columns={columns} data={users} />}
    </div>
  );
}
