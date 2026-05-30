const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — JWT Bearer token middleware.
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it with JWT_SECRET, loads the user from the DB
 * (excluding sensitive fields), and attaches it to req.user.
 *
 * Returns 401 if the token is missing, invalid, or the user
 * no longer exists.
 */
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId).select(
      '-password -refreshToken -googleId'
    );

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = { protect };
