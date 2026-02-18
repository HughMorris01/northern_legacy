const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Who placed the order
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  
  // The specific items bought. Embedded here so prices and state tags are frozen in time.
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      priceAtPurchase: { type: Number, required: true }, 
      weightInOunces: { type: Number, required: true }, 
      metrcPackageUid: { type: String, required: true }, 
      productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    }
  ],

    // Financials & Compliance Auditing
  totalAmount: { type: Number, required: true },
  totalWeightInOunces: { type: Number, required: true }, 

  // --- COMPLIANCE TIMESTAMPS ---
  orderPlacedAt: { type: Date, default: Date.now },
  orderPaidAt: { type: Date },
  orderFulfilledAt: { type: Date },
  
  // Physical routing details
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    terrainType: { type: String, required: true, enum: ['Land', 'Water'] }
  },
  paymentMethod: { type: String, required: true },
  
  // Strict PRD Enums
  orderType: { 
    type: String, 
    required: true, 
    enum: ['In-Store POS', 'In-Store Pickup', 'Land Delivery', 'Water Delivery'] 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['Paid-Pending Delivery', 'Paid-Pending Pickup', 'Unpaid-Pending Pickup', 'Completed', 'Cancelled'] 
  },
  
  // --- STATE COMPLIANCE (METRC) ---
  metrcApiStatus: { 
    type: String, 
    enum: ['Pending', 'Success', 'Failed - Queued for Retry'], 
    default: 'Pending' 
  },
  metrcSalesReceiptId: {
    type: String 
  },
  
  // Future implementations for the Driver App
  handoffToken: { type: String },
  
  // Standard GeoJSON formatting required by MongoDB for distance math
  deliveryCoordinates: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number] 
    }
  }
}, {
  timestamps: true 
});

orderSchema.index({ deliveryCoordinates: '2dsphere' });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
module.exports = Order;