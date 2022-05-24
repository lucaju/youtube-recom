import bcrypt from 'bcryptjs';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { Document, Model, model, Schema, Types } from 'mongoose';
import type { IUser } from '../types';

export interface IUserMethods {
  generateAuthToken(): Promise<string>;
}

export interface IUserModel extends Model<IUser, Record<string, never>, IUserMethods> {
  findByCredentials(
    email: string,
    password: string
  ): Promise<Document<unknown, any, IUser> & IUser & { _id: Types.ObjectId } & IUserMethods>;
  findByEmail(
    email: string
  ): Promise<Document<unknown, any, IUser> & IUser & { _id: Types.ObjectId } & IUserMethods>;
}

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
            Joi.string().pattern(new RegExp('^(?=.*)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$'))
          );
        },
        message:
          'Password must be at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number, and can contain special characters',
      },
    },
    tokens: [{ type: String, required: true }],
  },
  { timestamps: true }
);

UserSchema.virtual('Projects', {
  ref: 'Project',
  localField: 'id',
  foreignField: 'owner',
});

UserSchema.methods.toJSON = function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  const userObject = user.toObject();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, tokens, ...publicData } = userObject;

  return publicData;
};

UserSchema.methods.generateAuthToken = async function () {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw Error('No JWT Secret found');

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, jwtSecret);

  user.tokens = [...user.tokens, token];
  await user.save();

  return token;
};

UserSchema.statics.findByCredentials = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email });
  if (!user || !user.password) throw new Error('Unable to login');

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error('Unable to login');

  return user;
};

UserSchema.statics.findByEmail = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error('User not found!');
  return user;
};

// Hash the plain text password before saving
UserSchema.pre('save', async function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  if (!user.password) return;
  if (user.isModified('password')) user.password = await bcrypt.hash(user.password, 8);
});

export const UserModel = model<IUser, IUserModel>('User', UserSchema);
