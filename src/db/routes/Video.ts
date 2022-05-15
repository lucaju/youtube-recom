import { IYTvideo } from '../../types';
import { VideoModel } from '../models';

export const getVideo = async (videoId: string) => (
  await VideoModel.findOne({ id: videoId })
);

export const save = async (video: IYTvideo) => (
  await VideoModel.create(video)
);
