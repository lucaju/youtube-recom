import { model, Model, Schema } from 'mongoose';
import { IVideo } from '../../types';

export const YTRecommendationsSchema = new Schema<IVideo, Model<IVideo>>({}, { strict: false });

export const YTRecommendationsModel = model<IVideo, Model<IVideo>>(
  'YTVideosRecommendations',
  YTRecommendationsSchema
);
