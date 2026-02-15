const mongoose = require('mongoose');
const { LEGAL_LIMITS } = require('../utils/constants'); // <-- Add this import

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Links to the customer who placed the order
  },
  // The specific items bought. We EMBED the details here so they are frozen in time.
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // Price in cents at the exact time of checkout
      weightInOunces: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product' // Links to the original SKU
      }
    }
  ],
  // --- MARITIME & LAND LOGISTICS ---
  terrainType: {
    type: String,
    enum: ['Land', 'Maritime'],
    required: true
  },
  deliveryCoordinates: {
    // Standard GeoJSON formatting required by MongoDB for distance math
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // Array of [longitude, latitude]
      required: true
    }
  },
  deliveryDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Links to the employee delivering the order
  },
  // --- FINANCIALS & COMPLIANCE ---
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  totalWeightInOunces: {
    type: Number,
    required: true,
    max: [LEGAL_LIMITS.MAX_OUNCES_PER_ORDER, 'Legal limit exceeded: Order cannot be larger than 3 ounces.']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Forfeited'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Forfeited'],
    default: 'Pending'
  },
  // Required by NY OCM for outbound sales reporting
  metrcSalesReceiptId: {
    type: String
  }
}, {
  timestamps: true
});

// Creates a specialized geospatial index so MongoDB can quickly calculate delivery routes
orderSchema.index({ deliveryCoordinates: '2dsphere' });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;