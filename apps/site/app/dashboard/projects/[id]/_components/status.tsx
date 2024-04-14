'use client';

import { Label } from '@/components/ui/label';
import { Pill } from '@/components/ui/pill';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { useState } from 'react';
import { Project } from 'youtube-recommendation-crawler-api/types';
import { useProject } from '../../hooks/useProject';

interface Props {
  id: Project['id'];
  notification: Project['preferences']['notification'];
  lastRunAt?: Date | null;
  nextRunAt?: Date | null;
  status: Project['status'];
}

export const Status = ({ id, notification, status, lastRunAt, nextRunAt }: Props) => {
  const { activateProject, deactivateProject, updateProject } = useProject();

  const [optimistStatus, setOptimiststatus] = useState(status);
  const [optimistPrefNotfifyEmail, setOptimistPrefNotfifyEmail] = useState(notification.email);

  const handleChangeStatus = () => {
    setOptimiststatus(optimistStatus === 'active' ? 'inactive' : 'active');
    status === 'active' ? deactivateProject(id) : activateProject(id);
  };

  const handleChangeNotification = () => {
    setOptimistPrefNotfifyEmail(!optimistPrefNotfifyEmail);
    updateProject(id, {
      preferences: {
        notification: {
          email: !optimistPrefNotfifyEmail,
          discord: notification.discord,
        },
      },
    });
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="status"
          checked={optimistStatus === 'active'}
          onCheckedChange={handleChangeStatus}
        />
        <Label className="capitalize" htmlFor="status">
          {status}
        </Label>
      </div>
      {lastRunAt && <Pill value={format(lastRunAt, 'yyyy-MM-dd @ hh:mm')}>Last Run</Pill>}
      {optimistStatus === 'active' && (
        <>
          {nextRunAt && <Pill value={format(nextRunAt, 'yyyy-MM-dd @ hh:mm')}>Next Run</Pill>}
          <div className="flex items-center space-x-2">
            <Switch
              id="notify-email"
              checked={optimistPrefNotfifyEmail}
              onCheckedChange={handleChangeNotification}
            />
            <Label htmlFor="notify-email">Notify by email</Label>
          </div>
        </>
      )}
    </div>
  );
};
