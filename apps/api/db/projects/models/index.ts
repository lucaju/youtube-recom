import type { Project } from '@/types/project';
import { Model, model } from 'mongoose';
import { ProjectDbSchema, ProjectMethods } from '../schemas';

export type ProjectModel = Model<Project, Record<string, never>, ProjectMethods>;

// export const ProjectDbModel =
//   mongoose.models.Project || model<Project, ProjectModel>('Project', ProjectDbSchema);

export const ProjectDbModel = model<Project, ProjectModel>('Project', ProjectDbSchema);
