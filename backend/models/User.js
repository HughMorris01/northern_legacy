const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // --- AUTHENTICATION PROVIDERS ---
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  googleId: { type: String, sparse: true, unique: true },
  facebookId: { type: String, sparse: true, unique: true },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  // Local Auth (No longer strictly required for OAuth users)
  passwordHash: { type: String },
  sessionToken: { type: String },

  // --- LEGAL IDENTITY (Populated during ID Verification) ---
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  dateOfBirth: { 
    type: String, 
    default: '1900-01-01' 
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  verificationRefNumber: { type: String },
  idDocumentHash: {
    type: String,
    unique: true,
    sparse: true 
  },
  idExpirationDate: {
    type: String, 
    default: null,
  },

  // --- DIGITAL IDENTITY & CONTACT ---
  preferredFirstName: { type: String, default: '' },
  preferredLastName: { type: String, default: '' },
  syncName: { type: Boolean, default: false },
  phoneNumber: { type: String, default: '' },

  // --- ADDRESSES & PREFERENCES ---
  address: { 
    street: { type: String },
    city: { type: String },
    postalCode: { type: String },
    terrainType: { type: String, default: 'Land' },
  },
  mailingAddress: { 
    street: { type: String },
    city: { type: String },
    postalCode: { type: String },
  },
  syncAddresses: { type: Boolean, default: false },
  linkedBank: { type: String, default: '' },

  // --- COMPLIANCE & ENFORCEMENT ---
  deliveryStrikes: [{
    type: Date
  }],
  isDeliveryBanned: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'budtender', 'driver'],
    default: 'customer'
  },
  
  // --- MARKETING & DATA PRIVACY ---
  smsOptIn: { type: Boolean, default: false },
  smsOptInTimestamp: { type: Date },
  isAnonymized: { type: Boolean, default: false },
  
  // --- SAVED STATE ---
  savedCart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      qty: { type: Number, required: true }
    }
  ]
}, {
  timestamps: true 
});

// ==========================================
// 🔐 BCRYPT METHODS
// ==========================================

userSchema.methods.matchPassword = async function (enteredPassword) {
  // Failsafe: If a Google user tries to login with a password, block it
  if (!this.passwordHash) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.pre('save', async function () {
  // THE FIX: If passwordHash isn't modified OR doesn't exist (OAuth), skip hashing
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return; 
  }

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// THE FIX: Safe compilation check for Nodemon reloads
const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;