import Joi from 'joi';
import { Schema } from 'mongoose';
import type { IUser } from '../types';
import type { IUserMethods, IUserModel } from './';

export const UserSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'This email is alread registered'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => Joi.assert(value, Joi.string().email()),
        message: 'Must be a valid email',
      },
    },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: { values: ['admin', 'user'], message: '{VALUE} is not supported' },
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string) => {
          return Joi.assert(
            value,
            Joi.string().pattern(new RegExp('^(?=.*)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$')),
          );
        },
        message:
          'Password must be at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number, and can contain special characters',
      },
    },
    tokens: [{ type: String, required: true }],
  },
  { timestamps: true },
);

UserSchema.virtual('Projects', {
  ref: 'Project',
  localField: 'id',
  foreignField: 'owner',
});
