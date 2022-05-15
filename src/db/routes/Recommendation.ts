import { IRecommendation } from '../../types';
import { RecommendationModel } from '../models';

export const save = async (data: IRecommendation) => {
  const recommendations = new RecommendationModel(data);
  return await recommendations.save();
};
