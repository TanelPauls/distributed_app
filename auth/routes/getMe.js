const express = require('express');
const auth = require('../middleware/auth');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({
    host: 'postgres',
    port: 5432,
    database: 'dist_app',
    user: process.env.POSTS_DB_USER,
    password: process.env.POSTS_DB_PASSWORD,
});

router.get('/me', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email FROM dist_app.users WHERE id = $1',
            [req.user.id]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;