import { Joi } from 'celebrate';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import JoiTimezone from 'joi-tz';
import { Schema } from 'mongoose';
import type { IProjectSchedule } from '../../types';

export const ScheduleSchema = new Schema<IProjectSchedule>(
  {
    atTime: {
      type: String,
      match: [
        /^(?:\d|[01]\d|2[0-3]):[0-5]\d$/,
        `{VALUE} must be in 24h time format: 'HH:mm'. e.g., '20:30'`,
      ],
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
      enum: { values: ['minute', 'day'], message: '{VALUE} is not supported' },
    },
    timezone: {
      type: String,
      validate: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        validator: (value: string) => Joi.assert(value, Joi.extend(JoiTimezone).timezone().empty()),
        Message: `{VALUE} is not a valid timezone. e.g., 'America/Toronto'`,
      },
    },
  },
  { _id: false },
);
