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
      priceAtPurchase: { type: Number, required: true }, // Price in cents at exact time of checkout
      metrcPackageUid: { type: String, required: true }, // THE SOURCE: The blue tag for the bulk batch
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
    type: String // THE DESTINATION: The unique ID for this specific transaction once pushed to Metrc
  },

  // Financials
  totalAmount: { type: Number, required: true },
  
  // Future implementations for the Driver App
  handoffToken: { type: String },
  
  // Standard GeoJSON formatting required by MongoDB for distance math
  deliveryCoordinates: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number] // Array of [longitude, latitude]
    }
  }
}, {
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt'
});

// Creates a specialized geospatial index so MongoDB can quickly calculate delivery routes (Haversine math)
orderSchema.index({ deliveryCoordinates: '2dsphere' });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;