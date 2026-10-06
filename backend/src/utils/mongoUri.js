const LOCAL_MONGO_URI = 'mongodb://localhost:27017/flightdb';

module.exports = function getMongoUri() {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGO_URI?.trim()
    || (isProduction ? '' : LOCAL_MONGO_URI);

  if (!mongoUri) {
    throw new Error('MONGO_URI is required in production; configure it with a reachable MongoDB connection string.');
  }

  if (isProduction && ['localhost', '127.0.0.1', '[::1]', '::1'].includes(new URL(mongoUri).hostname)) {
    throw new Error('MONGO_URI points to localhost in production. Configure it with a reachable hosted MongoDB connection string.');
  }

  return mongoUri;
};
