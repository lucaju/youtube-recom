'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import Link from 'next/link';
import { IoFlashOutline } from 'react-icons/io5';
import { LuTimerReset } from 'react-icons/lu';
import { RiPlayCircleLine, RiStopCircleLine } from 'react-icons/ri';
import type { Project } from 'youtube-recommendation-crawler-api/types';
import { DataTableColumnHeader } from './column-header';
import { DataTableRowActions } from './row-actions';

export const columns: ColumnDef<Project>[] = [
  {
    id: 'select',
    enableHiding: true,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: 'title',
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      const item = row.original as Project;
      const title: string = row.getValue('title');
      return (
        <Link href={`projects/${item.id}`}>
          <Button variant="link">{title}</Button>
        </Link>
      );
    },
  },
  {
    accessorKey: 'owner',
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
    cell: ({ row }) => {
      const owner: { name: string; id: string }[] = row.getValue('owner');
      return <div>{owner[0].name}</div>;
    },
  },
  {
    accessorKey: 'status',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status');
      const ephemeral = Boolean(row.getValue('ephemeral'));
      return (
        <div className="ml-3">
          {ephemeral ? (
            <IoFlashOutline />
          ) : status === 'active' ? (
            <RiPlayCircleLine />
          ) : (
            <RiStopCircleLine />
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'schedule',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Frequency" />,
    cell: ({ row }) => {
      const schedule: Project['schedule'] = row.getValue('schedule');
      const frequency = schedule.frequency;
      return (
        <div className="flex items-center gap-1 capitalize">
          {frequency !== 'once' && <LuTimerReset />}
          {frequency}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const date: string = row.getValue('createdAt');
      return <div>{format(date, 'dd MMM yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
