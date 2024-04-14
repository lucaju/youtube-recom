'use client';

import Editor from '@/components/ui/editor/editor';
import type { Project } from 'youtube-recommendation-crawler-api/types';
import { useProject } from '../../hooks/useProject';

interface Props {
  projectId: Project['id'];
  value?: Project['description'];
}

export const Description = ({ projectId, value }: Props) => {
  const { updateProject } = useProject();

  const onSubmit = (currentvalue: string) => {
    if (currentvalue === value) return;
    updateProject(projectId, { description: currentvalue });
  };

  return (
    <div className="min-h-52">
      <Editor
        className="h-36 overflow-auto"
        content={value ?? ''}
        name="description"
        onBlur={(content) => onSubmit(content)}
      />
    </div>
  );
};
