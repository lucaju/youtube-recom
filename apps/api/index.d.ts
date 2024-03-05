import 'express-serve-static-core';
import { UserDbModel } from './db/schemas';

import { Request } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      currentUser?: InstanceType<typeof UserDbModel>;
      token?: string;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    currentUser?: InstanceType<typeof UserDbModel>;
    token?: string;
  }
}

declare const x: Express.Request;
declare const y: Request;

export {};
