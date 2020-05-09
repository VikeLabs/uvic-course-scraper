import mongoose from 'mongoose';
import dotenv from 'dotenv';

let database: mongoose.Connection;

dotenv.config();

export const connect = async () => {
  if (database) {
    return;
  }

  let uri = process.env.MONGO_URI;
  if (!uri) {
    uri = 'mongodb://localhost:27017/test?retryWrites=true&w=majority';
    console.log(`MONGO_URI not found, using default - ${uri}`);
  }

  console.log('Attempting to connect to mongo...');

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  database = mongoose.connection;
  console.log('Connected to mongo');
};

export const disconnect = () => {
  if (!database) {
    return;
  }
  mongoose.disconnect();
};

export const clearDB = () => {
  return database.dropCollection('courses');
};
