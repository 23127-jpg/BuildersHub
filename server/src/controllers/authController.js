const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateTokens = require('../utils/generateTokens');

/**
 * Generates a URL-safe username from a display name.
 * Appends a random suffix to avoid collisions.
 *
 * @param {string} name
 * @returns {string}
 */
const generateUsername = (name) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
  const suffix = Math.floor(Math.random() * 10000);
  return `${base}${suffix}`;
};

/**
 * POST /api/auth/register
 * Creates a new user account and returns tokens.
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    const missing = [];
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters.',
      });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate a unique username
    let username = generateUsername(name);
    let usernameExists = await User.findOne({ username });
    while (usernameExists) {
      username = generateUsername(name);
      usernameExists = await User.findOne({ username });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      username,
    });

    // Sign tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user._id.toString(),
      username: user.username,
    });

    // Store hashed refresh token
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns new tokens.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email (case-insensitive via lowercase index)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Reject OAuth-only accounts that have no password
    if (!user.password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Sign new tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user._id.toString(),
      username: user.username,
    });

    // Store hashed refresh token
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * POST /api/auth/refresh
 * Exchanges a valid refresh token for a new access token.
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let decoded;
    try {
      decoded = require('jsonwebtoken').verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { accessToken } = generateTokens({
      userId: user._id.toString(),
      username: user.username,
    });

    return res.status(200).json({ accessToken });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * POST /api/auth/logout
 * Invalidates the user's refresh token.
 * Requires protect middleware.
 */
const logout = async (req, res) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { register, login, refresh, logout };
