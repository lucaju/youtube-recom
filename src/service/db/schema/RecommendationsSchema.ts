import mongoose from 'mongoose';

const { Schema } = mongoose;

const RecommendationsSchema = new Schema({}, { strict: false });

export default RecommendationsSchema;
