const express = require('express');
const passport = require('passport');
const { register, login, refresh, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const generateTokens = require('../utils/generateTokens');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Protected routes
router.post('/logout', protect, logout);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      const user = req.user;
      const { accessToken, refreshToken } = generateTokens({
        userId: user._id.toString(),
        username: user.username,
      });
      user.refreshToken = await bcrypt.hash(refreshToken, 10);
      await user.save();
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`);
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;
