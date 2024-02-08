import 'express-serve-static-core';
import type { IUserModel } from '../../../db/users';

declare module 'express-serve-static-core' {
  interface Request {
    currentUser?: IUserModel;
    token?: string;
  }
}
