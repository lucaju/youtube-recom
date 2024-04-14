'use client';

import { AlertDialog } from '@/components/dialog/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import type { Project } from 'youtube-recommendation-crawler-api/types';
import { useProject } from '../../hooks/useProject';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const {
    activateProject,
    alertOpen,
    deactivateProject,
    deleteProject,
    isProcessing,
    setAlertOpen,
  } = useProject();

  const item = row.original as Project;

  const handleClickDelete = () => {
    setAlertOpen(true);
  };

  const changeStatus = () => {
    item.status === 'active' ? deactivateProject(item.id) : activateProject(item.id);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="data-[state=open]:bg-muted flex h-8 w-8 p-0" variant="ghost">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={changeStatus}>
            {item.status === 'active' ? 'Deactive' : 'Activate'}
          </DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleClickDelete} variant="destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        isProcessing={isProcessing}
        onCancel={() => setAlertOpen(false)}
        onConfirm={() => deleteProject(item.id)}
        open={alertOpen}
        title="Are you absolutely sure?"
      >
        This action cannot be undone. This will permanently delete this project and its data from
        the servers.
      </AlertDialog>
    </>
  );
}
