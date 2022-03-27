import { IVideo } from '../../types';
import { YTRecommendationsModel } from '../models';

export const save = async (data: { keyword: string; date: string; videos: IVideo[] }) => {
  const recommendations = new YTRecommendationsModel(data);
  await recommendations.save();
};
