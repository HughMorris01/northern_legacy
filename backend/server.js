const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const webhookRoutes = require('./routes/webhookRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes'); 
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

// Load Environment Variables
dotenv.config();
connectDB();

// Initialize App
const app = express();

app.set('trust proxy', 1);

// Essential Middleware
app.use(express.json()); // Allows us to parse JSON in request bodies
app.use(cookieParser()); // Allows Express to read the JWT in the cookies

// CORS: Acts as the bouncer. 
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://northern-legacy.vercel.app',
    'https://northernlegacyny.com',
    'https://www.northernlegacyny.com'
  ],
  credentials: true, // <-- CRITICAL: Allows the secure JWT cookie to be sent
}));// Prevents CORS errors when the frontend (port 5173 and Vercel) talks to the backend (port 5000)
app.use(helmet()); // Sets various HTTP headers for security
app.use(morgan('dev')); // Logs all incoming requests to your terminal for debugging

app.get('/', (req, res) => {
  res.send('Northern Legacy API is online and compliant.');
});


// --- KEEP ALIVE HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.status(200).send('Server is awake');
});

// Mount the routes to the /api/routes URL path
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/delivery', deliveryRoutes);

// ==========================================
// 🚀 SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`---`);
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`---`);
});

// --- INTERNAL KEEP-ALIVE CRON ---
// Only run this in production so you aren't pinging localhost infinitely
if (process.env.NODE_ENV === 'production') {
  const RENDER_URL = 'https://northern-legacy.onrender.com/api/health'; // Replace with your actual Render URL
  
  // 9 minutes = 9 * 60 * 1000 = 540000 milliseconds
  setInterval(async () => {
    try {
      const response = await fetch(RENDER_URL);
      if (response.ok) {
        console.log('Keep-alive ping successful');
      }
    } catch (error) {
      console.error('Keep-alive ping failed:', error.message);
    }
  }, 540000); 
}