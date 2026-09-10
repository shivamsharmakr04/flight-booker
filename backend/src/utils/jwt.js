const jwt = require('jsonwebtoken');

exports.signToken = (user) => {
  const secret = process.env.JWT_SECRET || 'supersecret_flight_jwt_key_2026';
  return jwt.sign(
    { id: user._id, email: user.email },
    secret,
    { expiresIn: '7d' }
  );
};
