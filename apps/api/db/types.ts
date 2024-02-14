import { Job } from 'agenda';
import { Types } from 'mongoose';
import type { ICrawlerConfig, IVideo } from 'youtube-recommendation-crawler';

export type UserRole = 'admin' | 'user';
export type ScheduleFrenquency = 'minute' | 'hour' | 'day' | 'week' | 'month';

export interface IProjectSchedule {
  atTime?: string;
  frequency: ScheduleFrenquency;
  timezone?: string;
}

export interface IProjectStatus {
  running: boolean;
  scheduled: boolean;
  lastDate?: Date;
  nextDate?: Date;
}

export interface IProject {
  active: boolean;
  crawler: ICrawlerConfig;
  owner: Types.ObjectId;
  schedule: IProjectSchedule;
  status: IProjectStatus;
  title: string;
  job?: Job;
}

export interface IRecommendation {
  date: Date;
  keyword: string;
  videos: IVideo[];

  project: Types.ObjectId;
}

export interface IUser {
  email: string;
  name: string;
  role: UserRole;
  id?: string;
  password?: string;
  tokens?: string[];
}
