import { bgCyan, bgRed } from 'kleur';
import log from 'loglevel';
import mongoose from 'mongoose';
import { initiate } from './initiate';

export * from './types';

export let connected = false;

export const connect = async () => {
  const mongoDBUrl = process.env.MONGODB_URL;
  if (!mongoDBUrl) {
    connected = false;
    return connected;
  }

  const mongo = await mongoose
    .connect(mongoDBUrl, { dbName: process.env.DATABASE })
    .catch((error) => log.error(error));

  connected = !!mongo;

  connected
    ? log.warn(bgCyan().black(' MongoDB connected '))
    : log.warn(bgRed().black(' MongoDB id NOT connected '));

  if (mongo) await initiate();

  return connected;
};

export const close = () => {
  mongoose.connection.close();
};

export default {
  connect,
  close,
  connected,
};
