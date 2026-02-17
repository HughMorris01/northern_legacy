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
    // Wipe the orders and products
    await Order.deleteMany();
    await Product.deleteMany();

    // Obliterate the Users collection AND its broken ghost indexes
    try {
      await User.collection.drop();
      console.log('Old user indexes destroyed.');
    } catch (error) {
      // It's perfectly fine if the collection doesn't exist yet
    }

    // Force Mongoose to read your User.js file and build the new, correct 'sparse' indexes
    await User.createIndexes();

    // 4. Insert the dummy users
    await User.insertMany(users);
    
    // 5. Insert the dummy products
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