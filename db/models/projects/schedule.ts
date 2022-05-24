import { Joi } from 'celebrate';
//@ts-ignore
import JoiTimezone from 'joi-tz';
import { Schema } from 'mongoose';
import { ISchedule } from '../../../job';
const Joi_ = Joi.extend(JoiTimezone);

export const ScheduleSchema = new Schema<ISchedule>(
  {
    hour: { type: Number, required: true },
    timezone: {
      type: String,
      validate: {
        validator: (value: string) => Joi.assert(value, Joi_.timezone().empty()),
        Message: `{VALUE} is not a valid timezone. e.g., 'America/Toronto'`,
      },
    },
  },
  { _id: false }
);
