const assert = require('node:assert/strict');
const test = require('node:test');
const mongoose = require('mongoose');
const connectMongo = require('../src/utils/connectMongo');

function withEnvironment(values, callback) {
  const original = {
    NODE_ENV: process.env.NODE_ENV,
    MONGO_URI: process.env.MONGO_URI,
  };

  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    return callback();
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('uses Atlas auth database and application database for SRV URIs', async () => {
  const originalConnect = mongoose.connect;
  let captured;
  mongoose.connect = (uri, options) => {
    captured = { uri, options };
    return Promise.resolve(mongoose);
  };

  try {
    return withEnvironment({
      NODE_ENV: 'production',
      MONGO_URI: 'mongodb+srv://db-user:encoded-password@cluster.example.mongodb.net/?retryWrites=true&w=majority',
    }, () => {
      return connectMongo().then(() => {
        assert.equal(captured.options.dbName, 'flightdb');
        assert.equal(captured.options.authSource, 'admin');
        assert.equal(captured.options.serverSelectionTimeoutMS, 10000);
      });
    });
  } finally {
    mongoose.connect = originalConnect;
  }
});

test('uses the application database without forcing Atlas auth for standard MongoDB URIs', async () => {
  const originalConnect = mongoose.connect;
  let captured;
  mongoose.connect = (uri, options) => {
    captured = { uri, options };
    return Promise.resolve(mongoose);
  };

  try {
    return withEnvironment({
      NODE_ENV: 'development',
      MONGO_URI: 'mongodb://127.0.0.1:27017/flightdb',
    }, () => {
      return connectMongo().then(() => {
        assert.equal(captured.options.dbName, 'flightdb');
        assert.equal('authSource' in captured.options, false);
      });
    });
  } finally {
    mongoose.connect = originalConnect;
  }
});
