'use client';

import { Button } from '@/components/ui/button';
import { TypographyH4 } from '@/components/ui/typography';
import { serverApi } from '@/serverApi';
import { signOut, useSession } from 'next-auth/react';
import { LuGitCompare } from 'react-icons/lu';

export default function Topbar() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    if (!session) return;
    await serverApi.users.logout({ headers: { authorization: `Bearer ${session.user.token}` } });
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="sticky top-0 border-gray-200 bg-white dark:bg-gray-900">
      <div className="mx-auto flex flex-wrap items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <LuGitCompare className="h-6 w-6" />
          <TypographyH4>YouTube Recommendation</TypographyH4>
        </div>
        <Button onClick={handleSignOut} variant="secondary">
          Sign Out
        </Button>
      </div>
    </nav>
  );
}
