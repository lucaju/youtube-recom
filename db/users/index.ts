import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Document, Model, model, Types } from 'mongoose';
import type { IUser } from '../types';
import { UserSchema } from './Schema';

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

UserSchema.methods.toJSON = function () {
  const user = this as Document<unknown, any, IUser> & IUserMethods;
  const userObject = user.toObject();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, tokens, ...publicData } = userObject;

  return publicData;
};

UserSchema.methods.generateAuthToken = async function () {
  const user = this as Document<unknown, any, IUser> &
    IUser & { _id: Types.ObjectId } & IUserMethods;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw Error('No JWT Secret found');

  const token = jwt.sign({ _id: user._id.toString() }, jwtSecret);

  user.tokens = [...(user.tokens ?? []), token];
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
  const user = this as Document<unknown, any, IUser> & IUser;

  if (!user.password) return;
  if (user.isModified('password')) user.password = await bcrypt.hash(user.password, 8);
});

export const UserModel = model<IUser, IUserModel>('User', UserSchema);
