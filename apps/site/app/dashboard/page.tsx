import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/dashboard/projects');
  return <h1>Hello, Admin Page!</h1>;
}
