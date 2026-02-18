const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      
      const currentSessionToken = crypto.randomBytes(20).toString('hex');
      
      user.sessionToken = currentSessionToken;
      await user.save();

      generateToken(res, user._id, currentSessionToken);

      // We now explicitly return the preferred names and sync status on login
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        preferredFirstName: user.preferredFirstName, 
        preferredLastName: user.preferredLastName,
        syncName: user.syncName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        idExpirationDate: user.idExpirationDate,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Auth with Google
// @route   POST /api/users/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body; 

    // 1. Verify the token with Google's secure servers
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // 2. Extract the user info from the payload
    const { email, given_name, family_name, sub: googleId } = ticket.getPayload();

    // 3. Check for Account Collision
    let user = await User.findOne({ email });

    if (user) {
      // User exists. Did they sign up manually before? Link the Google ID seamlessly!
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // 4. Create a brand new passwordless user
      // COMPLIANCE: Notice we put the names in 'preferred', leaving strict legal fields blank!
      user = await User.create({
        email,
        authProvider: 'google',
        googleId,
        preferredFirstName: given_name || '',
        preferredLastName: family_name || '',
        isVerified: false, 
      });
    }

    // 5. Generate session token and log them in
    const currentSessionToken = crypto.randomBytes(20).toString('hex');
    user.sessionToken = currentSessionToken;
    await user.save();

    generateToken(res, user._id, currentSessionToken);

    // Send back the exact same payload as a standard login
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      preferredFirstName: user.preferredFirstName,
      preferredLastName: user.preferredLastName,
      syncName: user.syncName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      idExpirationDate: user.idExpirationDate,
    });

  } catch (error) {
    console.error(`Google Auth Error: ${error.message}`);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = async (req, res) => {
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

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: password, 
    });

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
      user.savedCart = req.body.cartItems.map((item) => ({
        product: item._id, 
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
    const user = await User.findById(req.user._id).populate('savedCart.product');
    
    if (user) {
      const formattedCart = user.savedCart
        .filter((item) => item.product !== null) 
        .map((item) => ({
          ...item.product._doc, 
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

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        preferredFirstName: user.preferredFirstName,
        preferredLastName: user.preferredLastName,
        syncName: user.syncName || false,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        isVerified: user.isVerified,
        idExpirationDate: user.idExpirationDate,
        address: user.address || {}, 
        mailingAddress: user.mailingAddress || {},
        syncAddresses: user.syncAddresses || false,
        linkedBank: user.linkedBank || '',
      });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error(`Get Profile Error: ${error.message}`);
    res.status(500).json({ message: 'Server error retrieving profile.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Basic Contact & Bank Info
      user.email = req.body.email || user.email;
      if (req.body.phoneNumber !== undefined) user.phoneNumber = req.body.phoneNumber;
      if (req.body.linkedBank !== undefined) user.linkedBank = req.body.linkedBank;
      
      // Preferred Name Updates
      if (req.body.preferredFirstName !== undefined) user.preferredFirstName = req.body.preferredFirstName;
      if (req.body.preferredLastName !== undefined) user.preferredLastName = req.body.preferredLastName;
      if (req.body.syncName !== undefined) user.syncName = req.body.syncName;

      // THE NAME SYNC LOGIC
      if (user.syncName) {
        if (user.isVerified) {
          user.preferredFirstName = user.firstName;
          user.preferredLastName = user.lastName;
        } else {
          // Failsafe: Cannot sync if no legal identity exists
          user.syncName = false;
        }
      }

      // Address Updates
      if (req.body.syncAddresses !== undefined) user.syncAddresses = req.body.syncAddresses;
      if (req.body.address) {
        user.address = {
          street: req.body.address.street || user.address?.street || '',
          city: req.body.address.city || user.address?.city || '',
          postalCode: req.body.address.postalCode || user.address?.postalCode || '',
          terrainType: req.body.address.terrainType || user.address?.terrainType || 'Land',
        };
      }
      if (req.body.mailingAddress) {
        user.mailingAddress = {
          street: req.body.mailingAddress.street || user.mailingAddress?.street || '',
          city: req.body.mailingAddress.city || user.mailingAddress?.city || '',
          postalCode: req.body.mailingAddress.postalCode || user.mailingAddress?.postalCode || '',
        };
      }

      // THE ADDRESS SYNC LOGIC
      if (user.syncAddresses) {
        if (user.address.terrainType === 'Land') {
          user.mailingAddress = {
            street: user.address.street,
            city: user.address.city,
            postalCode: user.address.postalCode,
          };
        } else {
          user.syncAddresses = false;
        }
      }

      if (req.body.password) {
        user.passwordHash = req.body.password; 
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        preferredFirstName: updatedUser.preferredFirstName,
        preferredLastName: updatedUser.preferredLastName,
        syncName: updatedUser.syncName,
        linkedBank: updatedUser.linkedBank,
      });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error(`Update Profile Error: ${error.message}`);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

// @desc    Delete user account (Anonymize data)
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = 'Deleted';
      user.lastName = 'User';
      user.email = `deleted_${user._id}@anonymized.com`; 
      user.phoneNumber = '';
      
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(Date.now().toString(), salt);

      user.idDocumentHash = undefined;
      user.verificationRefNumber = undefined;
      user.idExpirationDate = undefined;
      user.isVerified = false;
      user.savedCart = [];
      user.address = {};
      user.mailingAddress = {};

      await user.save();

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
  googleAuth,
  logoutUser,
  registerUser,
  saveUserCart,
  getUserCart,
  getUserProfile,
  updateUserProfile,
  deleteAccount 
};