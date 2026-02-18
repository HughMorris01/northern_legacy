import Order from '../models/Order.js';
import Product from '../models/Product.js';

const addOrderItems = async (req, res) => {
  const {
    orderItems, // Sent from frontend cart
    shippingAddress,
    paymentMethod,
    totalAmount,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items found');
  }

  const validatedItems = [];
  let calculatedTotalWeight = 0;

  // 1. SECURE HYDRATION & RACE-CONDITION CHECK
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

    // Instead of trusting the frontend payload, we build the item strictly from the DB
    validatedItems.push({
      name: product.name,
      quantity: item.qty, // The only variable we trust from the frontend
      priceAtPurchase: product.price, 
      weightInOunces: product.weightInOunces, // Securely grabbed from DB
      metrcPackageUid: product.metrcPackageUid, // Securely grabbed from DB
      productId: product._id,
    });

    // Tally the total order weight for the state compliance field
    calculatedTotalWeight += (product.weightInOunces * item.qty);
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

  // 4. CREATE ORDER
  const order = new Order({
    items: validatedItems, // We use our highly secure, DB-hydrated array here
    customerId: req.user._id, 
    orderType: orderType,     
    shippingAddress,
    paymentMethod,
    totalAmount,
    totalWeightInOunces: calculatedTotalWeight, // Pass the calculated total weight
    handoffToken,
    status: initialStatus,
  });

  const createdOrder = await order.save(); 

  // 5. THE DEDUCTION
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
    const order = await Order.findById(req.params.id).populate(
      'customerId',
      'firstName lastName email'
    );

    if (order) {
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
    const orders = await Order.find({ customerId: req.user._id });
    res.status(200).json(orders);
  } catch (error) {
    console.error(`Fetch My Orders Error: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching user orders' });
  }
};

export { addOrderItems, getOrderById, getMyOrders };