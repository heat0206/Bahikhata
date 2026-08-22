const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const applicationRoutes = require('./routes/applicationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const authRoutes = require('./routes/authRoutes');
const { initScheduler } = require('./jobs/scheduler');

const startServer = async () => {
  try {
    // Connect to MongoDB before starting the server
    await connectDB();

    const app = express();

    // Enable trust proxy for secure cookies over reverse proxies (Render, Railway, Heroku, etc.)
    app.set('trust proxy', 1);

    // Dynamic origin configuration: allow configured CLIENT_URL(s) and standard localhost ports
    const clientUrls = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
      : [];

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
      ...clientUrls,
    ].filter(Boolean);

    // Middleware
    app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
          }
        },
        credentials: true,
      })
    );
    app.use(express.json());   // Parse JSON request bodies
    app.use(cookieParser());   // Parse cookies for auth

    // Health check endpoint for deployment monitoring
    app.get('/', (req, res) => {
      res.status(200).json({ status: 'healthy', message: 'PrepBoard API is running' });
    });

    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/applications', applicationRoutes);
    app.use('/api/chatbot', chatbotRoutes);

    // Start the server and scheduler
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      initScheduler();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


