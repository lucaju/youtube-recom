import { Schema } from 'mongoose';
import type { IProjectMethods, IProjectModel } from '..';
import type { IProject } from '../..';
import { CrawlerSchema } from './crawler';
import { ScheduleSchema } from './schedule';
import { StatusSchema } from './status';

export const ProjectSchema = new Schema<IProject, IProjectModel, IProjectMethods>(
  {
    active: { type: Boolean, default: true },
    crawler: { type: CrawlerSchema, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    schedule: { type: ScheduleSchema, required: true },
    status: { type: StatusSchema },
    title: { type: String, trim: true, minLength: 3, required: true },
  },
  { timestamps: true },
);

ProjectSchema.virtual('recommendations', {
  ref: 'Recommendation',
  localField: '_id',
  foreignField: 'project',
});
