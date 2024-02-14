import { Schema } from 'mongoose';
import type { IProjectStatus } from '../../types';

export const StatusSchema = new Schema<IProjectStatus>(
  {
    running: { type: Boolean, default: false },
    scheduled: { type: Boolean, default: true },
    lastDate: Date,
    nextDate: Date,
  },
  { _id: false },
);
