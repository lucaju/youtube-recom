import { serverApi } from '@/serverApi';
import { authOptions } from '@/app/api/auth/auth';
import { Separator } from '@/components/ui/separator';
import { TypographyH3 } from '@/components/ui/typography';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { EditUser } from './edit-user';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }

  const { status, body } = await serverApi.users.get({
    headers: { authorization: `Bearer ${session.user.token}` },
    params: { id: 'me' },
  });

  if (status === 401 || status === 404 || status === 500) {
    redirect('/');
  }

  const user = body;

  return (
    <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between px-4 py-2">
      <div className="flex items-center space-x-4">
        <TypographyH3>Profile</TypographyH3>
      </div>
      <Separator className="my-2" />
      {user ? <EditUser user={user} /> : 'something went wrong'}
    </div>
  );
}
