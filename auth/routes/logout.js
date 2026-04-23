const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { hashToken, findByToken, revokeToken } = require('../models/tokens');

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;

    if (token) {
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      } catch (err) {
        // token is invalid/expired, just clear the cookie and move on
        res.clearCookie('refresh_token', { path: '/auth/refresh' });
        res.clearCookie('access_token');
        return res.json({ message: 'Logged out' });
      }

      const tokenHash = hashToken(token);
      const doc = await findByToken(tokenHash, decoded.jti);

      if (doc) {
        await revokeToken(doc.id);  // mark as revoked in DB
      }
    }

    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    res.json({ message: 'Logged out' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;