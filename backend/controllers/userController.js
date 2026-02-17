const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

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
        isVerified: user.isVerified,
        idExpirationDate: user.idExpirationDate,
        verificationRefNumber: user.verificationRefNumber,
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

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1. Check if the email is already in use
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Create the user (our Mongoose pre-save middleware will automatically hash the password!)
    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: password, // We map the plain text password to our schema's field name
    });

    // 3. If successfully created, generate the token and send back the data
    if (user) {
      generateToken(res, user._id);
      
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        idExpirationDate: user.idExpirationDate,
        verificationRefNumber: user.verificationRefNumber,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error(`Registration Error: ${error.message}`);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Save user cart to database
// @route   PUT /api/users/cart
// @access  Private
const saveUserCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      // req.body.cartItems comes directly from Zustand local storage
      user.savedCart = req.body.cartItems.map((item) => ({
        product: item._id, // Map the frontend _id to the backend product ObjectId
        qty: item.qty
      }));
      await user.save();
      res.status(200).json({ message: 'Cart synchronized' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(`Save Cart Error: ${error.message}`);
    res.status(500).json({ message: 'Server error saving cart' });
  }
};

// @desc    Get user cart from database
// @route   GET /api/users/cart
// @access  Private
const getUserCart = async (req, res) => {
  try {
    // Find the user and populate the product details so the frontend gets all the imagery/pricing
    const user = await User.findById(req.user._id).populate('savedCart.product');
    
    if (user) {
      // Reformat the database cart to perfectly match what Zustand expects
      const formattedCart = user.savedCart
        .filter((item) => item.product !== null) // Strip out any products that were deleted from the DB by admins
        .map((item) => ({
          ...item.product._doc, // Spreads the product details
          qty: item.qty
        }));

      res.status(200).json(formattedCart);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(`Get Cart Error: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// @desc    Delete user account (Anonymize data)
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // 1. Anonymize personal identifiers
      user.firstName = 'Deleted';
      user.lastName = 'User';
      // We attach their ID to the email so MongoDB doesn't throw a "Duplicate Email" error 
      // if multiple people delete their accounts
      user.email = `deleted_${user._id}@anonymized.com`; 
      
      // 2. Scramble the password so the account can never be logged into again
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(Date.now().toString(), salt);

      // 3. Wipe all sensitive compliance and Persona data
      user.idDocumentHash = undefined;
      user.verificationRefNumber = undefined;
      user.idExpirationDate = undefined;
      user.isVerified = false;
      user.savedCart = [];

      await user.save();

      // 4. Destroy their auth cookie to instantly log them out
      res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
      });

      res.status(200).json({ message: 'User account successfully anonymized and closed.' });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error(`Delete Account Error: ${error.message}`);
    res.status(500).json({ message: 'Server error during account deletion.' });
  }
};

module.exports = {
  authUser,
  logoutUser,
  registerUser,
  saveUserCart,
  getUserCart,
  deleteAccount 
};