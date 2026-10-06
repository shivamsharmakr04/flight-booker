const assert = require('node:assert/strict');
const test = require('node:test');
const getMongoUri = require('../src/utils/mongoUri');

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
    callback();
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('uses the local MongoDB default outside production', () => {
  withEnvironment({ NODE_ENV: 'development', MONGO_URI: undefined }, () => {
    assert.equal(getMongoUri(), 'mongodb://localhost:27017/flightdb');
  });
});

test('requires a MongoDB URI in production', () => {
  withEnvironment({ NODE_ENV: 'production', MONGO_URI: undefined }, () => {
    assert.throws(getMongoUri, /MONGO_URI is required in production/);
  });
});

test('rejects localhost MongoDB in production', () => {
  withEnvironment({
    NODE_ENV: 'production',
    MONGO_URI: 'mongodb://localhost:27017/flightdb',
  }, () => {
    assert.throws(getMongoUri, /MONGO_URI points to localhost in production/);
  });
});

test('accepts a hosted MongoDB URI in production', () => {
  const hostedUri = 'mongodb+srv://user:password@example.mongodb.net/flightdb';
  withEnvironment({ NODE_ENV: 'production', MONGO_URI: hostedUri }, () => {
    assert.equal(getMongoUri(), hostedUri);
  });
});
