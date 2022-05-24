import { DateTime } from 'luxon';
import { Model, model, Schema } from 'mongoose';
import type { IProject } from '../..';
import { CrawlerSchema } from './crawler';
import { ScheduleSchema } from './schedule';
import { StatusSchema } from './status';
import { StorageSchema } from './storage';

export interface IProjectModel extends Model<IProject, Record<string, never>> {
  hasCollectedToday(projectId: string): Promise<boolean>;
}

export const ProjectSchema = new Schema<IProject, IProjectModel>(
  {
    active: { type: Boolean, default: true },
    crawler: { type: CrawlerSchema, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    schedule: { type: ScheduleSchema, required: true },
    status: { type: StatusSchema },
    storage: { type: StorageSchema },
    title: { type: String, trim: true, minLength: 3, required: true },
  },
  { timestamps: true }
);

ProjectSchema.statics.hasCollectedToday = async (projectId: string) => {
  const project = await ProjectModel.findById(projectId, { status: true });
  if (!project) throw new Error('Project not found');

  const { lastDate } = project.status;
  if (!lastDate) return false;

  const collected = DateTime.fromJSDate(lastDate).hasSame(DateTime.local(), 'day');
  return collected;
};

export const ProjectModel = model<IProject, IProjectModel>('Project', ProjectSchema);
