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
  // hastags?: Types.Array<string>;
  hastags?: string[];
  uploadDate?: string;
  datePublished?: string;

  channel?: IChannel;

  paid?: boolean;
  views?: number;
  likes?: number;
  comments?: number;

  // recomendations: Types.DocumentArray<IVideoRecommended>;
  recomendations: IVideoRecommended[];

  collectedAt: Date;
  depth: number;
  recommended: number;
}

export interface IVideoRecommended {
  id: string;
  title?: string;
}

export interface YTVideo {
  //Collected at th first time the video is visited
  id: string;
  title?: string;
  description?: string;
  duration?: string;
  // hastags?: Types.Array<string>;
  hastags?: string[];
  uploadDate?: string;
  datePublished?: string;
  paid?: boolean;
  collectedAt: Date;
  channel?: IChannel;

  //collected every time the video is recomended
  watched?: Types.DocumentArray<YTVideoWatched>;

  //calculated / update everytime the video is recommended
  views: number;
  likes: number;
  comments: number;
  recommended: number;
  minDepth: number;
}

export interface YTVideoWatched {
  id?: Types.ObjectId;
  keyword: string; //seed searched keyword
  watchedAt: Date; //date

  // the corrent data the recommendation
  views: number;
  likes: number;
  comments: number;
  depth: number;
  recommended: number;
  recommendations: Types.DocumentArray<IVideoRecommended>;
  // recomendations: IVideoRecommended[];
}
