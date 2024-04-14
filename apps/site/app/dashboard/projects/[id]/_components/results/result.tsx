'use client';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CollapsibleContent } from '@radix-ui/react-collapsible';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { ClientInferResponses } from '@ts-rest/core';
import { format } from 'date-fns';
import { useState } from 'react';
import { RxReload } from 'react-icons/rx';
import { contract } from 'youtube-recommendation-crawler-api/dist';
import type { Project, ProjectResult } from 'youtube-recommendation-crawler-api/types';
import { useProject } from '../../../hooks/useProject';
import { DataTable } from '../datatable';
import { columns } from '../datatable/columns';

type ResultSummary = ClientInferResponses<typeof contract.projects.results.getAll, 200>;

const MAX_VIDEOS = 5;

interface Props {
  project: Project;
  result: ResultSummary['body'][number];
}

export const Result = ({ project, result }: Props) => {
  const { isProcessing, getResult } = useProject();

  const [data, setData] = useState<ProjectResult | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  const title = `${format(result.date, 'yyyy-MM-dd @ HH:mm')} - ${result.keyword} (${result.videos}) videos`;

  const handleClick = async () => {
    if (data) return;
    const results = await getResult(project.id, result.id, { limit_videos: MAX_VIDEOS });
    setData(results);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild onClick={handleClick}>
        <div className="hover:bg-muted flex items-center space-x-4 px-4">
          <Button variant="ghost" size="sm">
            {isProcessing ? (
              <RxReload className="size-4 animate-spin" />
            ) : (
              <CaretSortIcon className="size-4" />
            )}
            <span className="sr-only">Toggle</span>
          </Button>
          <h4 className="text-sm font-semibold">{title}</h4>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2">
        {data && (
          <div className="mx-8">
            <h3>Top {MAX_VIDEOS} recommended videos</h3>
            <DataTable columns={columns} data={data.videos} />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
