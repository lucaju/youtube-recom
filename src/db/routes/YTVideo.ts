import { IYTvideo } from '../../types';
import { YTVideoModel } from '../models';

export const getVideo = async (videoId: string) => {
  const video = await YTVideoModel.findOne({ id: videoId });
  return video;
};

export const save = async (video: IYTvideo) => {
  const videoModel = await YTVideoModel.create(video);
  return videoModel;
};
