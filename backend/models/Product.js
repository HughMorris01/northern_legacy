const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Flower', 'Pre-Roll', 'Edible', 'Concentrate', 'Vape', 'Tincture', 'Accessories'],
    required: true
  },
  strainType: {
    type: String,
    enum: ['Indica', 'Sativa', 'Hybrid', 'CBD', 'N/A'],
    default: 'N/A'
  },
  // --- E-COMMERCE & DISPLAY FIELDS ---
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number, // Best Practice: Store in cents to avoid floating point math errors
    required: true,
    min: 0
  },
  image: {
    type: String, // URL to cloud storage (e.g., AWS S3 or Cloudinary)
    required: true
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // --- STRICT NY METRC COMPLIANCE LAYER ---
  metrcPackageUid: {
    type: String,
    required: true,
    unique: true
  },
  retailItemId: { // Required by NY OCM for unit tracking
    type: String,
    sparse: true,
    unique: true
  },
  thcContent: {
    type: Number, // Percentage or mg
    required: true
  },
  testingStatus: {
    type: String,
    enum: ['Not Submitted', 'TestPassed', 'RetestPassed', 'Failed'],
    default: 'Not Submitted'
  },
  // --- LOGISTICS & DELIVERY FIELDS ---
  weightInOunces: {
    type: Number,
    required: true 
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;