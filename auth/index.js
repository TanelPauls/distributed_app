const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

const pool = new Pool({
    host: 'postgres',
    port: 5432,
    database: 'dist_app',
    user: process.env.POSTS_DB_USER,
    password: process.env.POSTS_DB_PASSWORD,
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM dist_app.users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];

        if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
        }

        const payload = { id: user.id, email: user.email };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m'
        });

        res.json({ token });

    } catch (err) {
        console.error(err); // <-- add this for debugging
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(5006, '0.0.0.0', () => {
    console.log('Comments service.');
    console.log('App is started at http://localhost:5006');
});