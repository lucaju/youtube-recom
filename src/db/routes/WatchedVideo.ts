import { DateTime } from 'luxon';
import { IWatched } from '../../types';
import { WatchedVideoModel } from '../models';

export const isWatchedToday = async (keyword: string, id: string, date: Date) => {
  const dateTime = DateTime.fromJSDate(date);
  const year = dateTime.year;
  const month = dateTime.month;
  const day = dateTime.day;

  const start = DateTime.fromObject({ year, month, day }).toISO();
  const end = DateTime.fromObject({
    year,
    month,
    day,
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
  }).toISO();

  const video = await WatchedVideoModel.exists({
    keyword,
    id,
    date: { $gte: start, $lte: end },
  });
  return !!video;
};

export const save = async (watched: IWatched) => {
  const videoWtchedModel = await WatchedVideoModel.create(watched);
  return videoWtchedModel;
};
