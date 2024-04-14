'use client';

import { AlertDialog } from '@/components/dialog/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import type { User, UserRole } from 'youtube-recommendation-crawler-api/types';
import { useUser } from '../../hooks/useUser';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const user = row.original as User;
  const { alertOpen, changeRole, deleteUser, isProcessing, setAlertOpen } = useUser(user);

  const roleOptions: { label: string; value: UserRole }[] = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ];

  const handleClickDelete = () => {
    setAlertOpen(true);
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
        <DropdownMenuContent className="w-28" align="start">
          <DropdownMenuLabel>Role</DropdownMenuLabel>
          {roleOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={option.value === user.role}
              onCheckedChange={() => changeRole(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          {user.role !== 'admin' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleClickDelete} variant="destructive">
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        isProcessing={isProcessing}
        onCancel={() => setAlertOpen(false)}
        onConfirm={deleteUser}
        open={alertOpen}
        title="Are you absolutely sure?"
      >
        This action cannot be undone. This will permanently delete this user and their data from the
        servers.
      </AlertDialog>
    </>
  );
}
