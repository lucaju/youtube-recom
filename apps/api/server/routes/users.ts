import { contract } from '@/contract';
import { UserDbModel, type User } from '@/db/schemas/users';
import { logger } from '@/server/logger';
import { auth } from '@/server/middleware/auth';
import { emitIo } from '@/server/socket';
import { initServer } from '@ts-rest/express';

const s = initServer();

export const routerUsers = s.router(contract.users, {
  login: {
    middleware: [auth('basic')],
    handler: async ({ req: { currentUser, token } }) => {
      if (!token || !currentUser) {
        return { status: 404, body: { message: 'Unable to login' } };
      }

      emitIo('userEvent', { msg: 'login' });

      return { status: 200, body: { user: currentUser, token } };
    },
  },
  logout: {
    middleware: [auth('bearerJWT')],
    handler: async ({ req: { currentUser, token } }) => {
      if (!token || !currentUser) {
        return { status: 401, body: { message: 'Please Authenticate' } };
      }

      currentUser.tokens = currentUser.tokens?.filter((tokn: string) => tokn !== token);
      await currentUser.save();

      emitIo('userEvent', { message: 'logout' });

      return { status: 200, body: { message: 'logout' } };
    },
  },
  logoutAll: {
    middleware: [auth('bearerJWT')],
    handler: async ({ req: { currentUser, token } }) => {
      if (!token || !currentUser) {
        return { status: 401, body: { message: 'Please Authenticate' } };
      }

      currentUser.tokens = [];
      await currentUser.save();

      emitIo('userEvent', { message: 'logout all' });

      return { status: 200, body: { message: 'logout' } };
    },
  },
  users: {
    middleware: [auth('bearerJWT')],
    handler: async ({ req: { currentUser } }) => {
      if (currentUser?.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const users = await UserDbModel.find();
      return { status: 200, body: users };
    },
  },
  user: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      if (params.id === 'me') {
        return { status: 200, body: currentUser };
      }

      if (currentUser.id !== params.id && currentUser.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const user = await UserDbModel.findById(params.id).catch((err) => {
        logger.error(err);
        return null;
      });

      if (!user) {
        return { status: 404, body: { message: 'User not found' } };
      }

      return { status: 200, body: user };
    },
  },
  createUser: {
    middleware: [auth('bearerJWT')],
    handler: async ({ req: { currentUser }, body }) => {
      if (currentUser?.role !== 'admin') {
        return { status: 401, body: { message: 'Unauthorized' } };
      }

      const userModel = new UserDbModel(body);
      const user = await userModel.save().catch((err) => {
        logger.error(err);
        return null;
      });

      if (!user) {
        return { status: 409, body: { message: 'Failed. Email already exists.' } };
      }

      return { status: 201, body: user };
    },
  },
  updateUser: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser, token }, body }) => {
      if (params.id !== 'me' || currentUser?.id !== params.id) {
        if (currentUser?.role !== 'admin') {
          return { status: 401, body: { message: 'Unauthorized' } };
        }
      }

      // check valid operation
      const updates = Object.keys(body) as (keyof User)[];
      if (updates.length === 0) {
        return { status: 400, body: { message: 'Bad request' } };
      }

      const user = params.id === 'me' ? currentUser : await UserDbModel.findById(params.id);
      if (!user) {
        return { status: 404, body: { message: 'User not found' } };
      }

      const allowedUpdates = ['name', 'password'];
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return { status: 400, body: { message: 'Invalid update' } };
      }

      updates.forEach((update) => {
        user[update as keyof User] = body[update as keyof typeof body];
      });

      const passwordUpdate = allowedUpdates.find((type) => type === 'password');
      if (passwordUpdate) {
        user.tokens = user.tokens?.filter((t: string) => t === token);
      }

      await user.save();

      return { status: 200, body: user };
    },
  },
  deleteUser: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (params.id !== 'me' || currentUser?.id !== params.id) {
        if (currentUser?.role !== 'admin') {
          return { status: 401, body: { message: 'Unauthorized' } };
        }
      }

      const userToDelete = params.id === 'me' ? currentUser : await UserDbModel.findById(params.id);
      if (!userToDelete) {
        return { status: 404, body: { message: 'User not found' } };
      }

      await UserDbModel.findOneAndDelete({ _id: userToDelete.id });
      return { status: 200, body: { message: 'User deleted.' } };
    },
  },
});
