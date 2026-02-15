const mongoose = require('mongoose');

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
  }
}, {
  // Automatically manages 'createdAt' and 'updatedAt' timestamps
  timestamps: true 
});

const User = mongoose.model('User', userSchema);
module.exports = User;