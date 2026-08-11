const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // The JWT should be in the httpOnly cookie 'token'
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const secret = process.env.JWT_SECRET || 'prepboard_jwt_secret_key_default_2026';
    const decoded = jwt.verify(token, secret);

    // Get user from the token payload, attach only the ID to req.user
    // We don't fetch the whole user document from DB to keep the middleware fast,
    // we only need the user ID for ownership checks.
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
