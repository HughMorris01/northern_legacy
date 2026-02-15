const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// 1. Load Environment Variables
dotenv.config();
connectDB();

// 2. Initialize App
const app = express();

// 3. Essential Middleware
app.use(express.json()); // Allows us to parse JSON in request bodies
app.use(cors()); // Prevents CORS errors when the frontend (port 5173) talks to the backend (port 5000)
app.use(helmet()); // Sets various HTTP headers for security
app.use(morgan('dev')); // Logs all incoming requests to your terminal for debugging

// 4. Basic "Heartbeat" Route
app.get('/', (req, res) => {
  res.send('Northern Legacy API is online and compliant.');
});

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`---`);
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`---`);
});