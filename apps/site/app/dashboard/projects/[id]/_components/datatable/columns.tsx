'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Channel, Video } from 'youtube-recommendation-crawler-api/types';

const numberFormat = new Intl.NumberFormat('en-CA', { notation: 'compact' });

export const columns: ColumnDef<Video>[] = [
  {
    accessorKey: 'Rank',
    header: () => <div className="text-xs">Rank</div>,
    cell: ({ row }) => {
      return <div>{row.index + 1}</div>;
    },
  },
  {
    accessorKey: 'recommendations',
    id: 'recommendations',
    header: () => <div className="text-xs">Recommendations</div>,
    cell: ({ row }) => {
      const item = row.original as Video;
      return <div>{item.crawlerResults?.recommended ?? 0}</div>;
    },
  },
  {
    accessorKey: 'title',
    header: () => <div className="text-xs">Title</div>,
    cell: ({ row }) => {
      const title = row.getValue<string>('title');
      return <div>{title}</div>;
    },
  },
  {
    accessorKey: 'views',
    header: () => <div className="text-xs">Views</div>,
    cell: ({ row }) => {
      const views = row.getValue<number>('views');
      return <div>{numberFormat.format(views)}</div>;
    },
  },
  {
    accessorKey: 'likes',
    header: () => <div className="text-xs">Likes</div>,
    cell: ({ row }) => {
      const likes = row.getValue<number>('likes');
      return <div>{numberFormat.format(likes)}</div>;
    },
  },
  {
    accessorKey: 'channel',
    header: () => <div className="text-xs">Channel</div>,
    cell: ({ row }) => {
      const channel = row.getValue<Channel>('channel');
      return <div>{channel?.name}</div>;
    },
  },
];
