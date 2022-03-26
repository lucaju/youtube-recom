import { IVideo, YTVideo, YTVideoWatched } from '@src/types';
import mongoose, { Model } from 'mongoose';
import RecommendationsSchema from './schema/RecommendationsSchema';
import ytVideoSchema from './schema/YTVideo';

// import { red } from 'kleur';
// const {logError} = require('../logs/datalog');

export const connect = async () => {
  const mongoDB = process.env.MONGODB_URL;
  if (!mongoDB) return false;

  try {
    return await mongoose.connect(mongoDB);
  } catch (err) {
    // console.log(red(err.name));
    // logError('Mongoose',err.name);
  }
};

const saveCollection = async (data: { keyword: string; date: string; videos: IVideo[] }) => {
  const RecommendationsModel = mongoose.model('recommendations', RecommendationsSchema);
  const recommendations = new RecommendationsModel(data);
  await recommendations.save();
};

const getVideo = async (videoId: string) => {
  const YTVideoModel = mongoose.model<YTVideo, Model<YTVideo>>('videos', ytVideoSchema);
  const video = await YTVideoModel.findOne({ id: videoId });
  return video;
};

const saveVideo = async (video: YTVideo) => {
  const YTVideoModel = mongoose.model<YTVideo, Model<YTVideo>>('videos', ytVideoSchema);
  const videoModel = await YTVideoModel.create(video);
  return videoModel;
};

const insertVideoWatch = async (videoID: string, watched: YTVideoWatched) => {
  const YTVideoModel = mongoose.model<YTVideo, Model<YTVideo>>('videos', ytVideoSchema);
  let videoModel = await YTVideoModel.findOneAndUpdate(
    { id: videoID },
    { $push: { watched: watched } }
  );

  //  * update video medatata
  videoModel = await YTVideoModel.findOneAndUpdate(
    { id: videoID },
    {
      views: watched.views,
      likes: videoModel?.likes ? Math.max(videoModel.likes, watched.likes) : watched.likes,
      comments: videoModel?.comments
        ? Math.max(videoModel.comments, watched.comments)
        : watched.comments,
      recommended: videoModel?.recommended ?? 0 + watched.recommended,
      minDepth: videoModel?.minDepth ? Math.min(videoModel.minDepth, watched.depth) : 0,
    }
  );

  return videoModel;
};

export const close = () => {
  mongoose.connection.close();
};

export default {
  connect,
  close,
  saveCollection,
  getVideo,
  saveVideo,
  // updateVideo,
  insertVideoWatch,
};
