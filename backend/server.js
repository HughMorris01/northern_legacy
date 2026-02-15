const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

// 1. Load Environment Variables
dotenv.config();
connectDB();

// 2. Initialize App
const app = express();

// 3. Essential Middleware
app.use(express.json()); // Allows us to parse JSON in request bodies
// 2. CORS: Acts as the bouncer. 
app.use(cors({
  origin: ['http://localhost:5173', 'https://northern-legacy.vercel.app'], 
  credentials: true 
})); // Prevents CORS errors when the frontend (port 5173) talks to the backend (port 5000)
app.use(helmet()); // Sets various HTTP headers for security
app.use(morgan('dev')); // Logs all incoming requests to your terminal for debugging

// 4. Basic "Heartbeat" Route
app.get('/', (req, res) => {
  res.send('Northern Legacy API is online and compliant.');
});

// Mount the product routes to the /api/products URL path
app.use('/api/products', productRoutes);

// ==========================================
// 🚀 SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`---`);
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`---`);
});