import Order from '../models/Order.js';
import Product from '../models/Product.js';

const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    totalAmount,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items found');
  }

  // 1. THE RACE-CONDITION CHECK
  for (const item of orderItems) {
    const product = await Product.findById(item._id);
    
    if (!product) {
      return res.status(404).json({ message: `Product ${item.name} is no longer available.` });
    }

    if (product.stockQuantity < item.qty) {
      return res.status(409).json({
        message: `Inventory Alert: Someone just grabbed the last of the ${product.name}!`,
        errorType: 'INVENTORY_SHORTAGE',
        product: product, 
        remainingQty: product.stockQuantity
      });
    }
  }

  // 2. DETERMINE PRD STATUS & ORDER TYPE
  const initialStatus = paymentMethod === 'Pay In-Store' ? 'Awaiting Pickup' : 'Paid';
  
  let orderType = 'Land Delivery';
  if (paymentMethod === 'Pay In-Store') {
    orderType = 'In-Store Pickup';
  } else if (shippingAddress.terrainType === 'Water') {
    orderType = 'Water Delivery';
  }

  // 3. GENERATE HANDOFF TOKEN
  const handoffToken = `NL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // 4. CREATE ORDER (We do this BEFORE deducting inventory now!)
  const order = new Order({
    orderItems: orderItems.map((x) => ({
      ...x,
      product: x._id,
      _id: undefined, 
    })),
    customerId: req.user._id, // Fixed: Matched to PRD schema
    orderType: orderType,     // Fixed: Added missing required field
    shippingAddress,
    paymentMethod,
    totalAmount,
    handoffToken,
    status: initialStatus,
  });

  const createdOrder = await order.save(); // If this fails, the code stops here.

  // 5. THE DEDUCTION (Safe to execute because the order is saved)
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item._id, {
      $inc: { stockQuantity: -item.qty } 
    });
  }

  res.status(201).json(createdOrder);
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

export { addOrderItems, getOrderById, getMyOrders};