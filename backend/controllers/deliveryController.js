const asyncHandler = require('../middleware/asyncHandler');
const DeliverySchedule = require('../models/DeliverySchedule');
const StoreSettings = require('../models/StoreSettings');

// --- HELPER: Haversine Distance Formula (Returns Miles) ---
const getDistanceFromLatLonInMiles = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8; // Radius of earth in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// @desc    Get available delivery windows based on user location
// @route   POST /api/delivery/slots
// @access  Private (User must be logged in to check specific availability)
const getDeliverySlots = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('User coordinates required to calculate delivery zone.');
  }

  // 1. Get Global Settings (Create default if missing)
  let settings = await StoreSettings.findById('SETTINGS');
  if (!settings) {
    settings = await StoreSettings.create({ _id: 'SETTINGS' });
  }

  // 2. Generate the Rolling 3-Day Window
  const datesToCheck = [];
  const today = new Date();
  
  // LOGIC: If Same Day is enabled AND it's before cutoff (8PM), add Today
  const currentHour = today.getHours();
  if (settings.sameDayDeliveryEnabled && currentHour < settings.deliveryCutoffHour) {
    datesToCheck.push(new Date(today)); // Today
  }

  // Always add Tomorrow and the Day After
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  datesToCheck.push(tomorrow);

  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  datesToCheck.push(dayAfter);

  // 3. The 3 Time Blocks
  const timeBlocks = ['Morning (8am - 12pm)', 'Afternoon (12pm - 4pm)', 'Evening (4pm - 8pm)'];
  
  const availability = [];

  // 4. Loop through every Date + Time combination
  for (let dateObj of datesToCheck) {
    const dateString = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const daySlots = {
      date: dateString,
      dayName: dayName, // "Friday"
      slots: []
    };

    for (let slot of timeBlocks) {
      // Find the schedule in DB
      const schedule = await DeliverySchedule.findOne({ date: dateString, timeSlot: slot });

      let slotStatus = 'Open'; // Default assumption
      let reason = '';

      // LOGIC GATE 1: Is the time passed? (Only for "Today")
      if (dateString === new Date().toISOString().split('T')[0]) {
        // Simple logic: If it's 1PM, Morning is dead.
        if (slot.includes('Morning') && currentHour >= 12) slotStatus = 'Unavailable';
        if (slot.includes('Afternoon') && currentHour >= 16) slotStatus = 'Unavailable';
        if (slot.includes('Evening') && currentHour >= 20) slotStatus = 'Unavailable';
      }

      if (schedule && slotStatus !== 'Unavailable') {
        // LOGIC GATE 2: Capacity Check
        if (schedule.currentOrderCount >= 12) {
          slotStatus = 'Full';
          reason = 'Driver Fully Booked';
        } 
        // LOGIC GATE 3: Geographic Anchor Check
        else if (schedule.status === 'Anchored') {
          const distance = getDistanceFromLatLonInMiles(
            lat, lng, 
            schedule.anchorCoordinates.lat, schedule.anchorCoordinates.lng
          );

          // THE 8-MILE RULE
          if (distance > 8) {
            slotStatus = 'Locked'; 
            reason = `Zone mismatch (${distance.toFixed(1)} miles from route)`;
          }
        }
      }

      daySlots.slots.push({
        time: slot,
        status: slotStatus,
        reason: reason
      });
    }
    availability.push(daySlots);
  }

  res.json(availability);
});

module.exports = { getDeliverySlots };