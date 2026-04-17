const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');

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
    const { email, password } = req.body;
    const result = await pool.query(
        'SELECT * FROM dist_app.users WHERE email = $1 AND password = $2',
        [email, password]
    );
    if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ user: result.rows[0] });
});

app.get('/', (req,res) => {
    res.send('JWT RUNNING');
})

app.listen(5006, '0.0.0.0', () => {
    console.log('Comments service.');
    console.log('App is started at http://localhost:5006');
});
