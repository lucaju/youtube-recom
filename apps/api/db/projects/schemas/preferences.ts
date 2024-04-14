import type { ProjectPreferences } from '@/types/project';
import { Schema } from 'mongoose';

export const ProjectPreferencesDbSchema = new Schema<ProjectPreferences>(
  {
    notification: {
      email: { type: Boolean, default: true },
      discord: { type: Boolean, default: true },
    },
  },
  { _id: false },
);
