// import { Model, model, Schema, Types } from 'mongoose';
// import { IVideo } from '../../crawler';
// import type { IYTvideo } from './types';

// export interface YTIVideoModel extends Model<IYTvideo> {
//   sanitize(video: IVideo): IYTvideo;
// }

// export const YTVideoSchema = new Schema<IYTvideo, YTIVideoModel>(
//   {
//     ytId: { type: String, required: true },
//     adCompanion: {
//       domain: String,
//       title: String,
//     },
//     channel: {
//       id: String,
//       name: String,
//     },
//     datePublished: Date,
//     description: String,
//     duration: String,
//     hastags: [String],
//     paid: { type: Boolean, default: false },
//     project: { type: Schema.Types.ObjectId, ref: 'Project' },
//     title: String,
//     uploadDate: Date,
//     watched: [{ type: Schema.Types.ObjectId, ref: 'WatchedVideo' }],
//   },
//   { strict: false, timestamps: true }
// );

// YTVideoSchema.statics.sanitize = async (video: IVideo) => {
//   const { ytId, title, description, duration, hastags, uploadDate, datePublished, paid, channel } =
//     video;

//   return {
//     ytId,
//     title,
//     description,
//     duration,
//     hastags: hastags as Types.Array<string>,
//     uploadDate,
//     datePublished,
//     paid,
//     channel,
//   };
// };

// export const YTVideoModel = model<IYTvideo, YTIVideoModel>('YTVideo', YTVideoSchema);
