'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface Props {
  user?: {
    id: string;
    role: string;
    token: string;
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
  };
}

export default function SideBar({ user }: Props) {
  return (
    <aside
      id="default-sidebar"
      className="top-18 fixed left-0 z-40 h-[calc(100vh-68px)] w-64 -translate-x-full transition-transform sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="flex h-full flex-col justify-between overflow-y-auto bg-gray-50 px-3 py-4 dark:bg-gray-900">
        <ul className="space-y-2 font-medium">
          <li>
            <Link href="/dashboard/projects">
              <Button className="w-full justify-start" variant="ghost">
                Projects
              </Button>
            </Link>
          </li>
          {user?.role === 'admin' && (
            <li>
              <Link href="/dashboard/users">
                <Button className="w-full justify-start" variant="ghost">
                  Users
                </Button>
              </Link>
            </li>
          )}
        </ul>

        <ul className="space-y-2 font-medium">
          <Separator />
          <li>
            <Link href="/dashboard/profile">
              <Button className="w-full justify-start" variant="ghost">
                Profile
              </Button>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
