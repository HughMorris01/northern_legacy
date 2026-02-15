const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// The seeder runs completely independent of your server, 
// so it needs to load the .env variables manually to find the database
dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    // 1. Wipe the database completely clean to prevent duplicates
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // 2. Insert the dummy users
    await User.insertMany(users);
    
    // 3. Insert the dummy products
    await Product.insertMany(products);

    console.log('✅ Northern Legacy Database Seeded!');
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

    console.log('🗑️ Database Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Check what command was passed in the terminal (e.g., node seeder.js -d)
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}