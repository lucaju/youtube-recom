import 'express-serve-static-core';
import type { IUser } from './db/users';

import { Request } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      currentUser?: IUser;
      token?: string;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    currentUser?: IUser;
    token?: string;
  }
}

declare const x: Express.Request;
declare const y: Request;

export {};
