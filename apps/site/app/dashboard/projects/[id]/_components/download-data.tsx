'use client';

import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';
import { RxReload } from 'react-icons/rx';
import type { Project } from 'youtube-recommendation-crawler-api/types';
import { useProject } from '../../hooks/useProject';

interface Props {
  project: Project;
}

export const DownloadData = ({ project }: Props) => {
  const { isProcessing, getData } = useProject();
  const handleDownlowad = async () => {
    const data = await getData(project.id);
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, project.title + '.json');
  };

  return (
    <Button disabled={isProcessing} onClick={handleDownlowad} variant="secondary">
      {isProcessing && <RxReload className="mr-2 h-4 w-4 animate-spin" />} Download Data
    </Button>
  );
};
