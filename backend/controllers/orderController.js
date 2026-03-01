import Order from '../models/Order.js';
import Product from '../models/Product.js';
import DeliverySchedule from '../models/DeliverySchedule.js'; 

// --- HELPER: Haversine Distance Formula ---
const getDistanceFromLatLonInMiles = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
const deg2rad = (deg) => deg * (Math.PI / 180);

const addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalAmount } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items found');
  }

  const validatedItems = [];
  let calculatedTotalWeight = 0;
  let calculatedTotalConcentrate = 0; 

  // 1. SECURE HYDRATION & INVENTORY RACE-CONDITION CHECK
  for (const item of orderItems) {
    const product = await Product.findById(item._id);
    
    if (!product) {
      return res.status(404).json({ 
        message: `${item.name} is no longer available in our catalog.`,
        errorType: 'INVENTORY_SHORTAGE',
        product: { _id: item._id, name: item.name }, 
        remainingQty: 0
      });
    }

    if (product.stockQuantity < item.qty) {
      return res.status(409).json({
        message: `Inventory Alert: Someone just grabbed the last of the ${product.name}!`,
        errorType: 'INVENTORY_SHORTAGE',
        product: product, 
        remainingQty: product.stockQuantity
      });
    }

    validatedItems.push({
      name: product.name, category: product.category, quantity: item.qty, 
      priceAtPurchase: product.price, weightInOunces: product.weightInOunces || 0, 
      concentrateGrams: product.concentrateGrams || 0, metrcPackageUid: product.metrcPackageUid, 
      productId: product._id,
    });

    calculatedTotalWeight += ((product.weightInOunces || 0) * item.qty);
    calculatedTotalConcentrate += ((product.concentrateGrams || 0) * item.qty);
  }

  let orderType = 'Land Delivery';
  if (shippingAddress.address === 'In-Store Pickup' || paymentMethod === 'Pay In-Store') orderType = 'In-Store Pickup';
  else if (shippingAddress.terrainType === 'Water') orderType = 'Water Delivery';

  const MIN_DELIVERY_AMOUNT = 100;
  if (orderType !== 'In-Store Pickup' && totalAmount < MIN_DELIVERY_AMOUNT) {
    res.status(400);
    throw new Error(`Delivery orders require a minimum of $${MIN_DELIVERY_AMOUNT.toFixed(2)}.`);
  }

  let initialStatus = orderType === 'In-Store Pickup' 
    ? (paymentMethod === 'Pay In-Store' ? 'Unpaid-Pending Pickup' : 'Paid-Pending Pickup') 
    : 'Paid-Pending Delivery'; 

  // 2. THE DAILY COMPLIANCE GATEKEEPER
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);

  const todaysOrders = await Order.find({
    customerId: req.user._id, createdAt: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['Cancelled', 'Refunded', 'Failed'] } 
  });

  let previousFlowerOz = 0; let previousConcentrateG = 0;
  todaysOrders.forEach(order => {
    previousFlowerOz += (order.totalWeightInOunces || 0);
    previousConcentrateG += (order.totalConcentrateGrams || 0);
  });

  if ((previousFlowerOz + calculatedTotalWeight) > 3.0 || (previousConcentrateG + calculatedTotalConcentrate) > 24.0) {
    return res.status(400).json({
      errorType: 'DAILY_LIMIT_EXCEEDED',
      message: `This order exceeds your daily legal limit when combined with previous purchases today.`
    });
  }

  // ==========================================
  // 3. THE DELIVERY ANCHOR GATEKEEPER (Race Condition Fix)
  // ==========================================
  if (orderType === 'Land Delivery' || orderType === 'Water Delivery') {
    const { deliveryDate, deliveryTimeSlot, lat, lng } = shippingAddress;
    
    if (deliveryDate && deliveryTimeSlot && lat && lng) {
      const schedule = await DeliverySchedule.findOne({ date: deliveryDate, timeSlot: deliveryTimeSlot });

      if (schedule) {
        // Did the van fill up while they were typing their card info?
        if (schedule.status === 'Full' || schedule.currentOrderCount >= 12) {
           return res.status(409).json({
             errorType: 'DELIVERY_UNAVAILABLE',
             message: `The ${deliveryTimeSlot} delivery window on ${deliveryDate} just reached maximum capacity. Please return to shipping to select a new window.`
           });
        }
        
        // Did someone else plant an anchor far away while they were typing their card info?
        if (schedule.status === 'Anchored') {
          const distance = getDistanceFromLatLonInMiles(lat, lng, schedule.anchorCoordinates.lat, schedule.anchorCoordinates.lng);
          if (distance > 8) {
             return res.status(409).json({
               errorType: 'DELIVERY_UNAVAILABLE',
               message: `Due to recent bookings, the ${deliveryTimeSlot} delivery window is no longer routing to your specific area. Please return to shipping to select a new window.`
             });
          }
        }
      }
    }
  }

  // 4. GENERATE HANDOFF TOKEN
  const handoffToken = `NL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // 5. CREATE ORDER
  const now = new Date(); 
  const isPrepaid = paymentMethod !== 'Pay In-Store';

  const order = new Order({
    items: validatedItems, customerId: req.user._id, orderType,     
    shippingAddress, paymentMethod, totalAmount, totalWeightInOunces: calculatedTotalWeight, 
    totalConcentrateGrams: calculatedTotalConcentrate, handoffToken,
    status: initialStatus, orderPlacedAt: now, orderPaidAt: isPrepaid ? now : undefined, 
  });

  const createdOrder = await order.save();

  // 6. COMMIT THE ROUTE ANCHOR
  if (orderType === 'Land Delivery' || orderType === 'Water Delivery') {
    const { deliveryDate, deliveryTimeSlot, lat, lng } = shippingAddress;
    if (deliveryDate && deliveryTimeSlot && lat && lng) {
      let schedule = await DeliverySchedule.findOne({ date: deliveryDate, timeSlot: deliveryTimeSlot });

      if (!schedule) {
        schedule = new DeliverySchedule({
          date: deliveryDate, timeSlot: deliveryTimeSlot, status: 'Anchored',
          currentOrderCount: 1, anchorCoordinates: { lat, lng }
        });
        await schedule.save();
      } else {
        schedule.currentOrderCount += 1;
        if (schedule.currentOrderCount >= 12) schedule.status = 'Full';
        await schedule.save();
      }
    }
  }

  // 7. THE INVENTORY DEDUCTION
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item._id, { $inc: { stockQuantity: -item.qty } });
  }

  res.status(201).json(createdOrder);
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customerId', 'firstName lastName email');
    if (order) {
      if (order.customerId._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
        res.status(200).json(order);
      } else {
        res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    console.error(`Fetch Order Error: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).sort({ orderPlacedAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error(`Fetch My Orders Error: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching user orders' });
  }
};

export { addOrderItems, getOrderById, getMyOrders };