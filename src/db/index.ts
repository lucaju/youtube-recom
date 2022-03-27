import mongoose from 'mongoose';

export let dbConnected = false;

// import { red } from 'kleur';
// const {logError} = require('../logs/datalog');

export const connect = async () => {
  const mongoDB = process.env.MONGODB_URL;
  if (!mongoDB) {
    dbConnected = false;
    return dbConnected;
  }

  try {
    await mongoose.connect(mongoDB);
    dbConnected = true;
  } catch (err) {
    dbConnected = false;
    // console.log(red(err.name));
    // logError('Mongoose',err.name);
  }
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
