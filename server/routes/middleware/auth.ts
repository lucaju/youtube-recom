import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../../db/users';

export const auth =
  (strategy?: string) => async (req: Request, res: Response, next: NextFunction) => {
    if (strategy === 'basic') {
      const credentials = req.header('Authorization')?.replace('Basic ', '');
      if (!credentials) return next();

      const decoded = Buffer.from(credentials, 'base64').toString('utf-8');
      const [email, password] = decoded.split(':');

      const currentUser = await UserModel.findByCredentials(email, password).catch(() => {
        res.status(404).send({ msg: 'Unable to login' });
      });
      if (!currentUser) return;
      const token = await currentUser.generateAuthToken();

      req.currentUser = currentUser;
      req.token = token;

      next();
      return;
    }

    if (strategy === 'bearerJWT') {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) throw Error('No JWT Secret found');

      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        res.status(401).send({ error: 'Please Authenticate.' });
        return;
      }

      const decoded = jwt.verify(token, jwtSecret);
      if (typeof decoded === 'string') {
        res.status(401).send({ error: 'Please Authenticate.' });
        throw Error('JWT decoded is a string');
      }

      const currentUser = await UserModel.findOne({
        _id: decoded._id,
        tokens: token,
      });
      if (!currentUser) return res.status(401).send({ error: 'Please Authenticate.' });

      req.currentUser = currentUser;
      req.token = token;

      next();
      return;
    }

    next();
  };
