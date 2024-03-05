import { UserDbModel } from '@/db/schemas/users';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../logger';
import { log } from '@/util/log';

export const auth =
  (strategy?: string) => async (req: Request, _res: Response, next: NextFunction) => {
    if (strategy === 'basic') {
      const credentials = req.header('Authorization')?.replace('Basic ', '');
      if (!credentials) {
        next();
        return;
      }

      const decoded = Buffer.from(credentials, 'base64').toString('utf-8');
      const [email, password] = decoded.split(':');

      const currentUser = await UserDbModel.findByCredentials(email, password);
      if (!currentUser) {
        next();
        return;
      }

      const token = await currentUser.generateAuthToken();

      req.currentUser = currentUser;
      req.token = token;

      next();
      return;
    }

    if (strategy === 'bearerJWT') {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        next();
        return;
      }

      const currentUser = await bearerJWT(token);
      if (!currentUser) {
        next();
        return;
      }

      req.currentUser = currentUser;
      req.token = token;

      next();
      return;
    }

    next();
  };

export const bearerJWT = async (token: string) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw Error('No JWT Secret found');

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded || typeof decoded === 'string') {
      log.error('JWT decoded is a string');
      return;
    }

    const currentUser = await UserDbModel.findOne({ _id: decoded._id, tokens: token });
    if (!currentUser) return;

    return currentUser;
  } catch (error) {
    logger.error(error);
    return;
  }
};
