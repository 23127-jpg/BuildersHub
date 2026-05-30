const jwt = require('jsonwebtoken');

/**
 * Signs an access token (15 min) and a refresh token (7 days).
 * Payload: { userId, username }
 *
 * @param {Object} payload - { userId: string, username: string }
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = ({ userId, username }) => {
  const accessToken = jwt.sign(
    { userId, username },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, username },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
