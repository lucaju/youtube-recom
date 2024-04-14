import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  heading: React.ReactNode;
}

export const SectionBox = ({ children, heading }: Props) => {
  return (
    <div className="prose dark:prose-invert min-h-40 rounded bg-slate-50 p-2 dark:bg-slate-800">
      <h3>{heading}</h3>
      {children}
    </div>
  );
};
