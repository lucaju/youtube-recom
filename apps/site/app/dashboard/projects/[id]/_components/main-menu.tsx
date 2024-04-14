'use client';

import { AlertDialog } from '@/components/dialog/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RxHamburgerMenu } from 'react-icons/rx';
import type { Project } from 'youtube-recommendation-crawler-api/types';
import { useProject } from '../../hooks/useProject';

interface Props {
  projectId: Project['id'];
}

export default function MainMenu({ projectId }: Props) {
  const { alertOpen, deleteProject, isProcessing, setAlertOpen } = useProject();
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button className="mx-1 h-8 w-8 " size="icon" variant="ghost">
            <RxHamburgerMenu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setAlertOpen(true)} variant="destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        isProcessing={isProcessing}
        onCancel={() => setAlertOpen(false)}
        onConfirm={() => deleteProject(projectId)}
        open={alertOpen}
        title="Are you absolutely sure?"
      >
        This action cannot be undone. This will permanently delete this project and its data from
        the servers.
      </AlertDialog>
    </>
  );
}
