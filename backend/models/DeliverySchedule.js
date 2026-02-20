const mongoose = require('mongoose');

const deliveryScheduleSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  timeSlot: {
    type: String,
    enum: ['Morning (8am - 12pm)', 'Afternoon (12pm - 4pm)', 'Evening (4pm - 8pm)'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'Anchored', 'Full'],
    default: 'Open',
  },
  // The exact coordinates of the first person to book this slot
  anchorCoordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  // We track how many orders are in this slot to hit our max of 12
  currentOrderCount: {
    type: Number,
    default: 0,
    max: 12
  }
}, {
  timestamps: true
});

// Ensures we don't accidentally create duplicate slots for the same date/time
deliveryScheduleSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

const DeliverySchedule = mongoose.models.DeliverySchedule || mongoose.model('DeliverySchedule', deliveryScheduleSchema);
module.exports = DeliverySchedule;