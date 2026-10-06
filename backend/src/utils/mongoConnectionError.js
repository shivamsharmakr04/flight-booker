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

  return `MongoDB connection error: ${error?.message || 'Unknown connection error'}`;
}

module.exports = getMongoConnectionErrorMessage;
