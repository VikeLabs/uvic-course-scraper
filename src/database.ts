import mongoose from 'mongoose';

let database: mongoose.Connection;

export const connect = async () => {
  // add your own uri below
  const uri = 'mongodb://localhost:27017/test?retryWrites=true&w=majority';
  if (database) {
    return;
  }
  await mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .catch(e => console.log(e));
  database = mongoose.connection;
  database.once('open', async () => {
    console.log('Connected to database');
  });
  database.on('error', () => {
    console.log('Error connecting to database');
  });
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
