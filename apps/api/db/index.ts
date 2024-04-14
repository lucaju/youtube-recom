import { log } from '@/util/log';
import kleur from 'kleur';
import mongoose from 'mongoose';
import { initialize } from './initialize';

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
    ? log.warn(kleur.bgCyan().black(' MongoDB connected '))
    : log.warn(kleur.bgRed().black(' MongoDB is NOT connected '));

  if (mongo) await initialize();

  return connected;
};

export const close = () => mongoose.connection.close();

const db = {
  connect,
  close,
  connected,
};

export default db;
