const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  // 1. Create the VIP wristband with the user's ID stamped inside
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Wristband expires in 30 days
  });

  // 2. Put the wristband in an HTTP-only cookie for maximum security
  // (This prevents cross-site scripting attacks from stealing the token)
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Uses secure HTTPS in production
    sameSite: 'strict', // Prevents cross-site request forgery
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });
};

module.exports = generateToken;