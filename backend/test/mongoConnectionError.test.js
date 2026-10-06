const assert = require('node:assert/strict');
const test = require('node:test');
const getMongoConnectionErrorMessage = require('../src/utils/mongoConnectionError');

test('explains how to fix MongoDB authentication failures without logging the URI', () => {
  const message = getMongoConnectionErrorMessage({
    code: 18,
    message: 'bad auth : authentication failed',
  });

  assert.match(message, /database user credentials/);
  assert.match(message, /URL-encode/);
  assert.match(message, /target database/);
  assert.match(message, /authSource=admin/);
  assert.doesNotMatch(message, /bad auth/);
});

test('preserves useful details for non-authentication connection failures', () => {
  assert.equal(
    getMongoConnectionErrorMessage({ message: 'ENOTFOUND cluster.example.mongodb.net' }),
    'MongoDB connection error: ENOTFOUND cluster.example.mongodb.net',
  );
});

test('gives safe instructions for incomplete mongodb+srv hostnames', () => {
  const message = getMongoConnectionErrorMessage({
    message: 'URI must include hostname, domain name, and tld',
  });

  assert.match(message, /full Atlas connection string/);
  assert.match(message, /Replace every placeholder/);
  assert.doesNotMatch(message, /mongodb\+srv:\/\/.*@/);
});

test('suggests Atlas network checks when the server selection times out', () => {
  const message = getMongoConnectionErrorMessage({
    name: 'MongooseServerSelectionError',
    message: 'Server selection timed out after 10000 ms',
  });

  assert.match(message, /Atlas Network Access/);
  assert.match(message, /outbound connections/);
});
