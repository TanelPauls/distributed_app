const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get('/me', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.json({ user: decoded });

    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;