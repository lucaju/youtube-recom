import { Types } from 'mongoose';

export type SortType = 'top_rated' | 'view_count' | 'Sorting search results by relevance';

export interface IAdCompanion {
  title?: string;
  domain?: string;
}

export interface IChannel {
  id: string;
  name: string;
}

export interface IRecommendation {
  date: Date;
  keyword: string;
  videos: IVideo[];
}

export interface IRecommendedVideo {
  id: string;
  title?: string;
}

export interface IYTvideo {
  id: string;
  title?: string;
  description?: string;
  duration?: string;
  hastags?: Types.Array<string>;
  paid?: boolean;
  uploadDate?: Date;
  datePublished?: Date;
  channel?: IChannel;
  watched?: Types.DocumentArray<IWatched>;
}

export interface IVideo {
  id: string;
  title?: string;
  description?: string;
  duration?: string;
  hastags?: string[];
  uploadDate?: Date;
  datePublished?: Date;

  channel?: IChannel;

  paid?: boolean;
  views?: number;
  likes?: number;
  comments?: number;

  adCompanion?: IAdCompanion;

  recomendations: IRecommendedVideo[];

  collectedAt: Date;
  depth: number;
  recommended: number;
}

export interface IWatched {
  id: string;
  title?: string;
  keyword: string;
  date: Date;
  views: number;
  likes: number;
  comments: number;
  depth: number;
  recommended: number;
  recommendations: Types.DocumentArray<IRecommendedVideo>;
  details?: Types.Subdocument<IYTvideo>;
}
