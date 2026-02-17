const jwt = require('jsonwebtoken');

// FIX: Added sessionToken as a required parameter
const generateToken = (res, userId, sessionToken) => {
  // FIX: Stamping BOTH the userId and the sessionToken into the JWT payload
  const token = jwt.sign({ userId, sessionToken }, process.env.JWT_SECRET, {
    expiresIn: '300m', 
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', 
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax', 
  });
};

module.exports = generateToken;