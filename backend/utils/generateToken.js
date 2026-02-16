const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30m', // <-- 30 minutes
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // MUST be true in production
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict', // <-- THIS IS THE FIX
    maxAge: 30 * 60 * 1000, // <-- 30 minutes
  });
};

module.exports = generateToken;