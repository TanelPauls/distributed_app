const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { hashToken, rotateRefreshToken, findByToken } = require('../models/tokens');
const { Pool } = require('pg');

const pool = new Pool({
    host: 'postgres',
    port: 5432,
    database: 'dist_app',
    user: process.env.POSTS_DB_USER,
    password: process.env.POSTS_DB_PASSWORD,
});

router.post('/refresh', async (req, res) => {
    try {
        const token = req.cookies?.refresh_token;
        if (!token) return res.status(401).json({ message: 'No refresh token' });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        const tokenHash = hashToken(token);
        const doc = await findByToken(tokenHash, decoded.jti);

        if (!doc) {
            return res.status(401).json({ message: 'Refresh token not recognized' });
        }
        if (doc.revoked_at) {
            return res.status(401).json({ message: 'Refresh token revoked' });
        }
        if (doc.expires_at < new Date()) {
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        // fetch fresh user from DB
        const result2 = await pool.query(
            'SELECT id, email FROM dist_app.users WHERE id = $1',
            [doc.user_id]
        );
        const user = result2.rows[0];

        const result = await rotateRefreshToken(doc, user, req, res);
        return res.json({ accessToken: result.accessToken });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;