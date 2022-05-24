import type { ICrawlerConfig } from '../crawler';

export interface ISchedule {
  hour: number;
  timezone?: string;
}
export interface IStorage {
  saveOnFile?: boolean;
  useDB?: boolean;
}

export interface IJobConfig {
  crawler: ICrawlerConfig;
  schedule: ISchedule;
  storage?: IStorage;
  title?: string;
}
