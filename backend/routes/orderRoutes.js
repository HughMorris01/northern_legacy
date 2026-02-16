const express = require('express');
const router = express.Router();
const { addOrderItems } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { addOrderItems, getOrderById } = require('../controllers/orderController');

// When a POST request hits /api/orders, first run protect, then run addOrderItems
router.post('/', protect, addOrderItems);
router.get('/:id', protect, getOrderById);

module.exports = router;