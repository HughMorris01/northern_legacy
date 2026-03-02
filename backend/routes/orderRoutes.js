const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addOrderItems, getOrderById, getMyOrders } = require('../controllers/orderController');

router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;