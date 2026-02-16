const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  try {
    // 1. Grab the email and password the user typed into the frontend
    const { email, password } = req.body;

    // 2. Look for a user in the database with that exact email
    const user = await User.findOne({ email });

    // 3. If the user exists AND the password matches the hashed password
    if (user && (await user.matchPassword(password))) {
      
      // Generate the JWT and put it in the httpOnly cookie
      generateToken(res, user._id);

      // Send the user's basic info back to the React frontend (DO NOT send the password!)
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    } else {
      // 401 stands for "Unauthorized"
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = async (req, res) => {
  // To "logout", we just overwrite the existing cookie with a blank one that expires instantly
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  authUser,
  logoutUser
};