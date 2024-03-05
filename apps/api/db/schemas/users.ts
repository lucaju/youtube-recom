import { log } from '@/util/log';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose, { Document, Model, model, Schema, Types } from 'mongoose';
import z from 'zod';

export const userRoles = ['admin', 'user'] as const;
export const userRoleSchema = z.enum(userRoles);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val)),
  email: z.string().email(),
  name: z.string(),
  role: userRoleSchema.default('user'),
  password: z.string().regex(/^(?=.*)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
  tokens: z.array(z.string()).optional(),
});
export type User = z.infer<typeof userSchema>;

export interface UserMethods {
  generateAuthToken(): Promise<string>;
}

export interface UserModel extends Model<User, Record<string, never>, UserMethods> {
  findByCredentials(
    email: string,
    password: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<Document<unknown, any, User> & User & { _id: Types.ObjectId } & UserMethods>;
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

UserDbSchema.virtual('Projects', {
  ref: 'Project',
  localField: 'id',
  foreignField: 'owner',
});

UserDbSchema.virtual('Jobss', {
  ref: 'Job',
  localField: 'id',
  foreignField: 'owner',
});

UserDbSchema.methods.toJSON = function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  const userObject = user.toObject();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, tokens, ...publicData } = userObject;

  return publicData;
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

UserDbSchema.statics.findByCredentials = async (email: string, password: string) => {
  const user = await UserDbModel.findOne({ email });
  if (!user) {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const user = this as Document<unknown, any, User> & User;

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  if (!user.password) return;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

export const UserDbModel = model<User, UserModel>('User', UserDbSchema);
