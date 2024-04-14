import type { ProjectResult } from '@/types/project';
import { Schema } from 'mongoose';
import { VideoDbSchema } from './videos';

export const ProjectResultDbSchema = new Schema<ProjectResult>({
  id: { type: String, required: true },
  date: { type: Date, required: true },
  keyword: { type: String, required: true },
  videos: [{ type: VideoDbSchema }],
});
