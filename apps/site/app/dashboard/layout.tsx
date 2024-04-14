import { auth } from '@/auth';
import SideBar from '@/components/sidebar';
import Topbar from '@/components/topbar';
import '../prose-mirror.css';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <section>
      <Topbar />
      <SideBar user={session?.user} />
      <section className="p-4 sm:ml-64">{children}</section>
    </section>
  );
}
