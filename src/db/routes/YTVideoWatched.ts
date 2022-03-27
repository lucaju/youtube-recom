import { IYTvideoWatched } from '../../types';
import { YTVideoWatchedModel } from '../models';

export const isWatchedToday = async (keyword: string, date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0).toISOString();
  const end = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  ).toISOString();

  const video = await YTVideoWatchedModel.exists({
    keyword,
    date: { $gte: start, $lte: end },
  });
  return !!video;
};

export const save = async (watched: IYTvideoWatched) => {
  const videoWtchedModel = await YTVideoWatchedModel.create(watched);
  return videoWtchedModel;
};
