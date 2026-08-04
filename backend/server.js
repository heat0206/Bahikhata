const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const applicationRoutes = require('./routes/applicationRoutes');

// Connect to MongoDB before starting the server
connectDB();

const app = express();

// Middleware
app.use(cors());           // Allow requests from Vite dev server
app.use(express.json());   // Parse JSON request bodies

// Routes — all application endpoints live under /api/applications
app.use('/api/applications', applicationRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
