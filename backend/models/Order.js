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
      weightInOunces: { type: Number, required: true }, // Item-level weight for compliance
      metrcPackageUid: { type: String, required: true }, 
      productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    }
  ],
  
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
    enum: ['Pending', 'Awaiting Pickup', 'Paid', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  
  // --- STATE COMPLIANCE (METRC) ---
  metrcApiStatus: { 
    type: String, 
    enum: ['Pending', 'Success', 'Failed - Queued for Retry'], 
    default: 'Pending' 
  },
  metrcSalesReceiptId: {
    type: String // Populated async after the state confirms receipt of the transaction
  },

  // Financials & Compliance Auditing
  totalAmount: { type: Number, required: true },
  totalWeightInOunces: { type: Number, required: true }, // Aggregate order weight
  
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

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;