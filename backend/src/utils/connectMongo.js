const mongoose = require('mongoose');
const getMongoUri = require('./mongoUri');

module.exports = function connectMongo() {
  const uri = getMongoUri();
  const isSrvConnection = new URL(uri).protocol === 'mongodb+srv:';

  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    dbName: 'flightdb',
    ...(isSrvConnection ? { authSource: 'admin' } : {}),
  });
};
