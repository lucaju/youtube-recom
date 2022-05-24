import { Types } from 'mongoose';
import type { IAdCompanion, IChannel, ICrawlerConfig, IRecommendedVideo, IVideo } from '../crawler';
import type { ISchedule, IStorage } from '../job';
import Job from '../job';

type Role = 'admin' | 'user';

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
  schedule: ISchedule;
  status: IProjectStatus;
  storage: IStorage;
  title: string;
  job?: Job
}

export interface IRecommendation {
  date: Date;
  keyword: string;
  videos: IVideo[];

  project?: Types.ObjectId;
}

export interface IUser {
  email: string;
  name: string;
  role: Role;
  id?: string;
  password?: string;
  tokens?: string[];
}

export interface IYTvideo {
  ytId: string;

  adCompanion?: IAdCompanion;
  channel?: IChannel;
  datePublished?: Date;
  description?: string;
  duration?: string;
  hastags?: Types.Array<string>;
  paid?: boolean;
  title?: string;
  uploadDate?: Date;
  watched?: Types.DocumentArray<IWatched>;

  project?: Types.ObjectId;
}

export interface IWatched {
  ytId: string;
  comments: number;
  date: Date;
  depth: number;
  keyword: string;
  likes: number;
  recommended: number;
  recommendations: Types.DocumentArray<IRecommendedVideo>;
  views: number;

  details?: Types.Subdocument<IYTvideo>;
  title?: string;

  project?: Types.ObjectId;
}
