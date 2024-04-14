import { userRoles, userSchema, type User } from '@/types/user';
import { log } from '@/util/log';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Schema } from 'mongoose';
import { UserDbModel, type UserModel } from '../models';

export interface UserMethods {
  generateAuthToken(): Promise<string>;
}

export const UserDbSchema = new Schema<User, UserModel, UserMethods>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'This email is already registered'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => userSchema.pick({ email: true }).spa(value),
        message: 'Must be a valid email',
      },
    },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: { values: userRoles, default: 'user' },
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string) => userSchema.pick({ password: true }).spa(value),
        message:
          'Password must be at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number, and can contain special characters',
      },
    },
    tokens: [{ type: String, required: true }],
  },
  { timestamps: true },
);

UserDbSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'ownerId',
});

UserDbSchema.statics.findByCredentials = async (email: string, password: string) => {
  const user = await UserDbModel.findOne({ email });
  if (!user || !user.password) {
    log.error('Unable to login: user not found');
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    log.error('Unable to login: password does not match');
    return;
  }

  return user;
};

// Hash the plain text password before saving
UserDbSchema.pre('save', async function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  if (!user.password) return;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

UserDbSchema.methods.toJSON = function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  const userObject = user.toObject() as typeof user & { _id: string };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
  const { password, tokens, _id, __v, updatedAt, ...publicData } = userObject;

  const _user = Object.assign({ id: userObject._id }, publicData);

  return _user;
};

UserDbSchema.methods.generateAuthToken = async function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw Error('No JWT Secret found');

  const token = jwt.sign({ _id: user._id.toString() }, jwtSecret);

  user.tokens = [...(user.tokens ?? []), token];
  await user.save();

  return token;
};
