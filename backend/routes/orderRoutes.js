const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addOrderItems, getOrderById, getMyOrders } = require('../controllers/orderController');

// When a POST request hits /api/orders, first run protect, then run addOrderItems
router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;