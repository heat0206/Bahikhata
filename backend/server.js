const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const applicationRoutes = require('./routes/applicationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const authRoutes = require('./routes/authRoutes');

// Connect to MongoDB before starting the server
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow frontend origin via Vite proxy or direct
  credentials: true,
}));
app.use(express.json());   // Parse JSON request bodies
app.use(cookieParser());   // Parse cookies for auth

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
