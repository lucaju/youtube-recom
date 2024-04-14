'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import type { User, UserRole } from 'youtube-recommendation-crawler-api/types';
import { DataTableColumnHeader } from './column-header';
import { DataTableRowActions } from './row-actions';

export const columns: ColumnDef<User>[] = [
  // {
  //   id: 'select',
  //   enableHiding: true,
  //   header: ({ table }) => (
  //     <Checkbox
  //       aria-label="Select all"
  //       checked={
  //         table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       aria-label="Select row"
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //     />
  //   ),
  // },
  {
    accessorKey: 'name',
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const name = row.getValue<string>('name');
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: 'email',
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      const email = row.getValue<string>('email');
      return <div>{email}</div>;
    },
  },
  {
    accessorKey: 'role',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const role = row.getValue<UserRole>('role');
      return <div>{role}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => {
      const createdAt = row.getValue<Date>('createdAt');
      return <div>{format(createdAt, 'MMM yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
