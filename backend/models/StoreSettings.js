const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  // We strictly use a singleton pattern (ID is always 'SETTINGS')
  _id: { type: String, required: true, default: 'SETTINGS' },
  
  sameDayDeliveryEnabled: {
    type: Boolean,
    required: true,
    default: false // Safer to default to FALSE so you don't get swamped unexpectedly
  },
  deliveryCutoffHour: {
    type: Number,
    required: true,
    default: 20 // 8:00 PM (20:00)
  }
}, {
  timestamps: true
});

const StoreSettings = mongoose.models.StoreSettings || mongoose.model('StoreSettings', storeSettingsSchema);
module.exports = StoreSettings;