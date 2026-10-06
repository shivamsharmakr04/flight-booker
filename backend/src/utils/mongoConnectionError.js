function getMongoConnectionErrorMessage(error) {
  const isAuthenticationError = error?.code === 18
    || error?.codeName === 'AuthenticationFailed'
    || /bad auth|authentication failed/i.test(error?.message || '');

  if (isAuthenticationError) {
    return [
      'MongoDB rejected the credentials in MONGO_URI.',
      'In Render, update MONGO_URI with the database user credentials (not your Atlas website login),',
      'URL-encode any special characters in the username or password, and verify the user has access to the target database.',
      'For MongoDB Atlas, also use the Atlas-generated connection string and include authSource=admin if you added a database name such as /flightdb to the URI path.',
      'The connection string was not logged.',
    ].join(' ');
  }

  if (/URI must include hostname, domain name, and tld/i.test(error?.message || '')) {
    return [
      'MongoDB rejected the mongodb+srv hostname as incomplete or invalid.',
      'Set MONGO_URI to the full Atlas connection string from Atlas Connect, including the complete cluster hostname.',
      'Replace every placeholder with its real value; do not include angle brackets or omit the cluster domain.',
      'The connection string was not logged.',
    ].join(' ');
  }

  if (/server selection timed out|ETIMEDOUT|connection timed out/i.test(error?.message || '')) {
    return [
      'Could not reach the MongoDB Atlas cluster before the connection timed out.',
      'Verify Atlas Network Access allows connections from this Render service,',
      'the cluster is available, and the Render service can make outbound connections to Atlas.',
      'The connection string was not logged.',
    ].join(' ');
  }

  return `MongoDB connection error: ${error?.message || 'Unknown connection error'}`;
}

module.exports = getMongoConnectionErrorMessage;
