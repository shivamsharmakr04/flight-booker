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
  assert.doesNotMatch(message, /bad auth/);
});

test('preserves useful details for non-authentication connection failures', () => {
  assert.equal(
    getMongoConnectionErrorMessage({ message: 'ENOTFOUND cluster.example.mongodb.net' }),
    'MongoDB connection error: ENOTFOUND cluster.example.mongodb.net',
  );
});
