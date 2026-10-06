const LOCAL_MONGO_URI = 'mongodb://localhost:27017/flightdb';

function encodeExtraCredentialAtSigns(uri) {
  const schemeEnd = uri.indexOf('://');
  if (schemeEnd < 0) return uri;

  const authorityStart = schemeEnd + 3;
  const remainder = uri.slice(authorityStart);
  const authorityEndOffset = remainder.search(/[/?#]/);
  const authorityEnd = authorityEndOffset < 0
    ? uri.length
    : authorityStart + authorityEndOffset;
  const authority = uri.slice(authorityStart, authorityEnd);
  const lastAtSign = authority.lastIndexOf('@');

  if (lastAtSign < 0) return uri;

  const rawCredentials = authority.slice(0, lastAtSign);
  const passwordSeparator = rawCredentials.indexOf(':');
  const encodeReservedCharacters = (value) => value
    .replace(/@/g, '%40')
    .replace(/\$/g, '%24');
  const credentials = passwordSeparator < 0
    ? encodeReservedCharacters(rawCredentials)
    : `${encodeReservedCharacters(rawCredentials.slice(0, passwordSeparator))}:`
      + encodeReservedCharacters(rawCredentials.slice(passwordSeparator + 1)).replace(/:/g, '%3A');
  const host = authority.slice(lastAtSign + 1);
  return `${uri.slice(0, authorityStart)}${credentials}@${host}${uri.slice(authorityEnd)}`;
}

module.exports = function getMongoUri() {
  const isProduction = process.env.NODE_ENV === 'production';
  let mongoUri = process.env.MONGO_URI?.trim()
    || (isProduction ? '' : LOCAL_MONGO_URI);

  if (!mongoUri) {
    throw new Error('MONGO_URI is required in production; configure it with a reachable MongoDB connection string.');
  }

  if (!/^mongodb(?:\+srv)?:\/\//i.test(mongoUri)) {
    throw new Error('MONGO_URI must start with mongodb:// or mongodb+srv://. Copy the complete connection string from your MongoDB provider.');
  }

  mongoUri = encodeExtraCredentialAtSigns(mongoUri);

  let parsedUri;
  try {
    parsedUri = new URL(mongoUri);
  } catch {
    throw new Error('MONGO_URI is malformed. Copy the complete connection string from your MongoDB provider and URL-encode special characters in the username and password.');
  }

  if (!parsedUri.hostname) {
    throw new Error('MONGO_URI has no hostname. Use the full database host from your MongoDB provider, not a placeholder or partial connection string.');
  }

  if (parsedUri.protocol === 'mongodb+srv:') {
    const labels = parsedUri.hostname.split('.');
    const validDomain = labels.length >= 2
      && labels.every((label) => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label));
    if (!validDomain) {
      throw new Error('MONGO_URI has an invalid mongodb+srv hostname. Use the full cluster hostname from your provider (for example, cluster.example.mongodb.net), without placeholders.');
    }
  }

  if (isProduction && ['localhost', '127.0.0.1', '[::1]', '::1'].includes(parsedUri.hostname)) {
    throw new Error('MONGO_URI points to localhost in production. Configure it with a reachable hosted MongoDB connection string.');
  }

  return mongoUri;
};
