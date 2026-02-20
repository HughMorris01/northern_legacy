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
    enum: ['Flower', 'Vape', 'Edible', 'Concentrate', 'Pre-Roll', 'Tincture', 'Accessory'],
    required: true
  },
  strainType: {
    type: String,
    required: false, 
    enum: ['Sativa', 'Indica', 'Hybrid', 'N/A', ''], 
  },
  // NEW: Added lineage tracking
  strainLineage: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number, 
    required: true,
    min: 0
  },
  image: {
    type: String, 
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
  thcContent: {
    type: Number, 
  },
  testingStatus: {
    type: String,
    enum: ['Not Submitted', 'TestPassed', 'RetestPassed', 'Failed'],
    default: 'Not Submitted'
  },
  // --- LOGISTICS & DELIVERY FIELDS ---
  weightInOunces: {
    type: Number,
    default: 0 
  },
  concentrateGrams: {
    type: Number,
    default: 0 
  },
  // --- MARKETING & SALES ---
  isLimitedRelease: {
    type: Boolean,
    default: false
  },
  isOnSpecial: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
module.exports = Product;