import mongoose from 'mongoose';

export let dbConnected = false;

export const connect = async () => {
  const mongoDBUrl = process.env.MONGODB_URL;
  if (!mongoDBUrl) {
    dbConnected = false;
    return dbConnected;
  }

  const mongo = await mongoose.connect(mongoDBUrl).catch(() => false);
  dbConnected = !!mongo;
  return dbConnected;
};

export const close = () => {
  mongoose.connection.close();
};

export default {
  connect,
  close,
  dbConnected,
};
