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

app.get('/posts', async (req, res) => {
    const result = await pool.query('SELECT * FROM dist_app.posts ORDER BY created_at ASC');
    res.json(result.rows);
});

app.post('/posts', async (req, res) => {
    const { title } = req.body;
    const result = await pool.query(
        'INSERT INTO dist_app.posts (title) VALUES ($1) RETURNING *',
        [title]
    );
    const post = result.rows[0];

    try {
        await axios.post('http://event-bus:5005/events', {
            type: 'PostCreated',
            data: post
        });
    } catch (err) {
        console.log('Error sending event to event bus', err.message);
    }

    res.status(201).json({ post });
});

app.post('/events', (req, res) => {
    res.json({});
});

app.listen(5000, '0.0.0.0', () => {
    console.log('Posts service.');
    console.log('App is started at http://localhost:5000');
});
