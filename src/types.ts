import { Types } from 'mongoose';

export type SortType = 'top_rated' | 'view_count' | 'Sorting search results by relevance';

export interface IChannel {
  id: string;
  name: string;
}

export interface IVideo {
  id: string;
  title?: string;
  description?: string;
  duration?: string;
  hastags?: string[];
  uploadDate?: string;
  datePublished?: string;

  channel?: IChannel;

  paid?: boolean;
  views?: number;
  likes?: number;
  comments?: number;

  recomendations: IVideoRecommended[];

  collectedAt: Date;
  depth: number;
  recommended: number;
}

export interface IVideoRecommended {
  id: string;
  title?: string;
}

export interface IYTvideo {
  id: string;
  title?: string;
  description?: string;
  duration?: string;
  hastags?: Types.Array<string>;
  uploadDate?: string;
  datePublished?: string;
  paid?: boolean;
  channel?: IChannel;
  watched?: Types.DocumentArray<IYTvideoWatched>;
}

export interface IYTvideoWatched {
  id: string;
  title?: string;
  keyword: string;
  date: Date;
  views: number;
  likes: number;
  comments: number;
  depth: number;
  recommended: number;
  recommendations: Types.DocumentArray<IVideoRecommended>;
  details?: Types.Subdocument<IYTvideo>;
}
