const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const products = require('./data/products');
// const orders = require('./data/orders'); // Uncomment this when you create your dummy orders file

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Load environment variables manually
dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async (type = 'all') => {
  try {
    // --- 1. ORDERS ---
    if (type === 'all' || type === 'orders') {
      await Order.deleteMany();
      // await Order.insertMany(orders); // Uncomment when ready
      console.log('✅ Orders collection reset.');
    }

    // --- 2. PRODUCTS ---
    if (type === 'all' || type === 'products') {
      await Product.deleteMany();
      await Product.insertMany(products);
      console.log('✅ Products collection seeded with fresh catalog.');
    }

    // --- 3. USERS ---
    if (type === 'all' || type === 'users') {
      try {
        await User.collection.drop();
        console.log('Old user indexes destroyed.');
      } catch (error) {
        // Safe to ignore if the collection doesn't exist
      }
      await User.createIndexes();
      await User.insertMany(users);
      console.log('✅ Users collection seeded.');
    }

    console.log(`🎉 Database Seeding (${type.toUpperCase()}) Complete!`);
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('🗑️ Entire Database Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// --- TERMINAL COMMAND ROUTER ---
const arg = process.argv[2];

if (arg === '-d') {
  destroyData();
} else if (arg === '-p') {
  importData('products');
} else if (arg === '-u') {
  importData('users');
} else if (arg === '-o') {
  importData('orders');
} else {
  importData('all'); // Catch-all default
}