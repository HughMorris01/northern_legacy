const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Requires Token)
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalAmount } = req.body;

    // FIX 1: Properly catch undefined or empty carts
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const itemsForDatabase = orderItems.map((item) => ({
      name: item.name,
      quantity: item.qty,
      priceAtPurchase: item.price,
      metrcPackageUid: item.metrcPackageUid,
      productId: item._id, 
    }));

    let determinedOrderType = 'Land Delivery';
    if (paymentMethod === 'Pay In-Store') {
      determinedOrderType = 'In-Store Pickup';
      
    // FIX 2: Optional Chaining (?.) prevents a crash if shippingAddress is undefined
    } else if (shippingAddress?.terrainType === 'Water') {
      determinedOrderType = 'Water Delivery';
    }

    const order = new Order({
      customerId: req.user._id, 
      items: itemsForDatabase,
      shippingAddress,
      paymentMethod,
      orderType: determinedOrderType,
      totalAmount,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
    
  } catch (error) {
    console.error(`Order Creation Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while creating order' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    // Find the order and attach the customer's name and email
    const order = await Order.findById(req.params.id).populate(
      'customerId',
      'firstName lastName email'
    );

    if (order) {
      // Security Check: Ensure the user requesting the order actually owns it (or is an admin)
      // Note: We will add the strict admin check later, for now we just verify ownership
      if (order.customerId._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
        res.status(200).json(order);
      } else {
        res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(`Fetch Order Error: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    // Find all orders matching this user's ID
    const orders = await Order.find({ customerId: req.user._id });
    res.status(200).json(orders);
  } catch (error) {
    console.error(`Fetch My Orders Error: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching user orders' });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
};