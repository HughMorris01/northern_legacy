const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - User must be logged in
const protect = async (req, res, next) => {
  let token;

  // 1. Read the JWT from the secure 'jwt' cookie we set during login
  token = req.cookies.jwt;

  if (token) {
    try {
      // 2. Mathematically verify the token hasn't been tampered with using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user in the database, but explicitly EXCLUDE the hashed password
      req.user = await User.findById(decoded.userId).select('-password');

      // NEW FIX: The Ghost Blocker. Reject the token if the account was soft-deleted!
      if (!req.user || req.user.email.includes('@anonymized.com')) {
        res.status(401);
        throw new Error('Not authorized, account disabled');
      }

      // NEW FIX: The "One Device" Check
      // If the cookie's token doesn't match the database token, someone else logged in!
      if (req.user.sessionToken !== decoded.sessionToken) {
        res.status(401);
        throw new Error('Session expired. You logged in on another device.');
      }

      // 4. Move on to the actual controller function
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // If there is no cookie at all
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Admin routes - User must be an Admin 
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };