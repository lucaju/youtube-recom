import { Schema } from 'mongoose';
import { IStorage } from '../../../job';

export const StorageSchema = new Schema<IStorage>(
  {
    useDB: { type: Boolean, default: true },
    saveOnFile: { type: Boolean, default: false },
  },
  { _id: false }
);
