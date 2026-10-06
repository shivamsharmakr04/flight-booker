const jwt = require('jsonwebtoken');

exports.signToken = (user) => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET must be configured before signing tokens.');
  }

  return jwt.sign(
    { id: user._id, email: user.email },
    secret,
    { expiresIn: '7d' }
  );
};
