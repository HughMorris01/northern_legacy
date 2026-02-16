const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  // The unique cryptographic hash of their physical ID to prevent ban evasion
  idDocumentHash: {
    type: String,
    unique: true,
    sparse: true // Allows accounts to be created before ID verification is complete
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationRefNumber: {
    type: String
  },
  idExpirationDate: { 
    type: Date },
  // Array of timestamps for the 12-month rolling strike logic
  deliveryStrikes: [{
    type: Date
  }],
  isDeliveryBanned: {
    type: Boolean,
    default: false
  },
  // Strict Role-Based Access Control (RBAC)
  role: {
    type: String,
    enum: ['customer', 'admin', 'budtender', 'driver'],
    default: 'customer'
  },
  phoneNumber: {
    type: String
  },
  smsOptIn: {
    type: Boolean,
    default: false
  },
  smsOptInTimestamp: {
    type: Date
  },
  // Data privacy compliance
  isAnonymized: {
    type: Boolean,
    default: false
  },
  savedCart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      qty: { type: Number, required: true }
    }
  ]
}, {
  // Automatically manages 'createdAt' and 'updatedAt' timestamps
  timestamps: true 
});

// ==========================================
// 🔐 BCRYPT METHODS
// ==========================================

// Method to compare the plain text password the user types in 
// against the scrambled hash saved in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Mongoose "Pre-Save" Middleware
// Before saving a user to the database, run this code to hash the password
// Mongoose "Pre-Save" Middleware
// Notice: We removed 'next' from the parentheses!
userSchema.pre('save', async function () {
  
  // If the password hasn't been modified (like if they just updated their cart), 
  // skip this entirely by returning out of the function early.
  if (!this.isModified('passwordHash')) {
    return; 
  }

  // Generate a cryptographic "salt" (random string added to the password before hashing)
  const salt = await bcrypt.genSalt(10);
  // Hash the password combined with the salt
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;