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

test('encodes extra raw at signs in MongoDB credentials before the host', () => {
  const uri = 'mongodb+srv://flight-user:pass@word$secure@example.mongodb.net/flightdb';
  withEnvironment({ NODE_ENV: 'production', MONGO_URI: uri }, () => {
    const normalizedUri = getMongoUri();
    const parsedUri = new URL(normalizedUri);

    assert.equal(parsedUri.hostname, 'example.mongodb.net');
    assert.equal(decodeURIComponent(parsedUri.password), 'pass@word$secure');
    assert.match(parsedUri.password, /%24/i);
  });
});

test('rejects a mongodb+srv URI with an incomplete hostname', () => {
  withEnvironment({
    NODE_ENV: 'production',
    MONGO_URI: 'mongodb+srv://user:password@cluster/flightdb',
  }, () => {
    assert.throws(getMongoUri, /invalid mongodb\+srv hostname/);
  });
});

test('rejects unsupported MongoDB URI schemes', () => {
  withEnvironment({
    NODE_ENV: 'production',
    MONGO_URI: 'https://db.example.mongodb.net/flightdb',
  }, () => {
    assert.throws(getMongoUri, /must start with mongodb:\/\//);
  });
});
