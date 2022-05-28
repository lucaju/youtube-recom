import { Types } from 'mongoose';
import type { IAdCompanion, IChannel, IRecommendedVideo } from '../../crawler';

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

  project: Types.ObjectId;
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

  project: Types.ObjectId;
}
