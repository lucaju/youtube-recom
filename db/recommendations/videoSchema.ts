import { Model, model, Schema } from 'mongoose';
import { IVideo } from '../../crawler';

// export interface IVideoModel extends Model<IVideo> {
//   sanitize(video: IVideo): IVideo;
// }

type IVideoModel = Model<IVideo>;

export const VideoSchema = new Schema<IVideo, IVideoModel>(
  {
    ytId: String,
    collectedAt: { type: Date, required: true },

    depth: Number,
    recommended: { type: Number, required: true },
    recommendations: [
      {
        ytId: String,
        title: String,
      },
    ],

    channel: {
      id: String,
      name: String,
    },
    datePublished: Date,
    description: String,
    duration: String,
    hastags: [String],
    paid: Boolean,
    title: String,
    uploadDate: Date,

    adCompanion: {
      domain: String,
      title: String,
    },
    comments: Number,
    likes: Number,
    views: Number,
  },
  { strict: false, timestamps: true }
);

// VideoSchema.statics.sanitize = async (video: IVideo) => {
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

export const VideoModel = model<IVideo, IVideoModel>('YTVideo', VideoSchema);
