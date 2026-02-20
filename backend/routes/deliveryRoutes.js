const express = require('express');
const router = express.Router();
const { getDeliverySlots } = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');

// We use POST because we need to send the complex coordinates in the body
router.post('/slots', protect, getDeliverySlots);

module.exports = router;