import type { User } from '@/types/user';
import { Model, model } from 'mongoose';
import { UserDbSchema, UserMethods } from '../schemas';

export interface UserModel extends Model<User, Record<string, never>, UserMethods> {
  findByCredentials(email: string, password: string): Promise<InstanceType<UserModel> | undefined>;
}

export const UserDbModel = model<User, UserModel>('User', UserDbSchema);
// export const UserDbModel = mongoose.models.User || model<User, UserModel>('User', UserDbSchema);
