export type SortType = 'top_rated' | 'view_count' | 'Sorting search results by relevance';

export interface IAdCompanion {
  domain?: string;
  title?: string;
}

export interface IChannel {
  id: string;
  name: string;
}

export interface ICrawlerConfig {
  keywords: string[];
  seeds: number;
  branches: number;
  depth: number;

  country?: string;
  language?: string;
}

export interface IRecommendedVideo {
  ytId: string;

  title?: string;
}

export interface IVideo {
  collectedAt: Date;
  depth: number;
  recomendations: IRecommendedVideo[];
  recommended: number;
  ytId: string;

  adCompanion?: IAdCompanion;
  channel?: IChannel;
  comments?: number;
  datePublished?: Date;
  description?: string;
  duration?: string;
  hastags?: string[];
  likes?: number;
  paid?: boolean;
  title?: string;
  uploadDate?: Date;
  views?: number;
}
