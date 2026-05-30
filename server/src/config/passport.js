const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Generates a unique username from a Google display name.
 * Lowercases, replaces spaces with underscores, appends a 4-digit suffix
 * if the base username is already taken.
 *
 * @param {string} displayName - Google profile display name
 * @returns {Promise<string>} unique username
 */
async function generateUniqueUsername(displayName) {
  const base = displayName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, ''); // strip non-alphanumeric chars

  let username = base || 'user';

  const taken = await User.findOne({ username });
  if (taken) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    username = `${username}_${suffix}`;

    // One extra retry in the extremely unlikely case of collision
    const stillTaken = await User.findOne({ username });
    if (stillTaken) {
      const suffix2 = Math.floor(1000 + Math.random() * 9000);
      username = `${base || 'user'}_${suffix2}`;
    }
  }

  return username;
}

// Only register the Google strategy if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: (process.env.SERVER_URL || 'http://localhost:5000') + '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('[Google OAuth] profile.id:', profile.id)
        console.log('[Google OAuth] displayName:', profile.displayName)
        console.log('[Google OAuth] name:', profile.name)
        console.log('[Google OAuth] emails:', profile.emails)

        const googleId = profile.id;
        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value.toLowerCase()
            : null;

        // Derive a name: prefer displayName, fall back to email prefix, then 'Builder'
        const rawName = profile.displayName
          || (profile.name && (profile.name.givenName || profile.name.familyName)
              ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim()
              : null)
          || (email ? email.split('@')[0] : null)
          || 'Builder'

        const name = rawName.trim() || 'Builder'

        const avatar =
          profile.photos && profile.photos[0]
            ? profile.photos[0].value
            : '';

        // ── 1. Try to find existing user by googleId ─────────────────────────
        let user = await User.findOne({ googleId });

        // ── 2. Fall back to matching by email (link existing account) ─────────
        if (!user && email) {
          user = await User.findOne({ email });
          if (user) {
            // Link the Google ID to the existing account
            user.googleId = googleId;
            if (!user.avatar && avatar) user.avatar = avatar;
            await user.save();
          }
        }

        // ── 3. Create a brand-new user ────────────────────────────────────────
        if (!user) {
          const username = await generateUniqueUsername(name);

          // Hard fallbacks to satisfy required schema fields
          const safeName = (name && name.trim()) ? name.trim() : (email ? email.split('@')[0] : 'Builder')
          const safeUsername = (username && username.trim()) ? username.trim() : `user_${Date.now()}`

          user = await User.create({
            name: safeName,
            username: safeUsername,
            email,
            googleId,
            avatar,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
} else {
  console.warn('[Passport] Google OAuth not configured — GOOGLE_CLIENT_ID/SECRET missing. Google login will be unavailable.')
}

// Minimal serialize/deserialize — only used during the OAuth redirect flow
// (session: false is set on the callback route, so these are rarely invoked)
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password -refreshToken');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
