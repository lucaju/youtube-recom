import { NewProjectForm } from './_components/form';

export default async function Page() {
  return (
    <div className="mx-auto max-w-screen-xl flex-wrap items-center justify-between px-4 py-2">
      <NewProjectForm />
    </div>
  );
}
