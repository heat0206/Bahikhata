const mongoose = require('mongoose');
const dns = require('dns');

// Use reliable public DNS resolvers to prevent querySrv ESERVFAIL on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (dnsErr) {
  // Ignore if custom DNS servers can't be set
}

// Connect to MongoDB Atlas using the URI from .env
// This function is called once when the server starts
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // Stop the server if DB connection fails
  }
};

module.exports = connectDB;
