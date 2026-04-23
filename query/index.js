const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');
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

async function verifyWithAuthService(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        const response = await axios.get('http://auth:5006/auth/verify', {
            headers: { authorization: authHeader }
        });
        req.user = response.data.user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

app.get('/posts', verifyWithAuthService, async (req, res) => {
    const result = await pool.query(`
        SELECT
            p.id, p.title, p.created_at,
            COALESCE(
                json_agg(
                    json_build_object('id', c.id, 'postId', c.post_id, 'content', c.content, 'status', c.status)
                    ORDER BY c.created_at ASC
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'
            ) AS comments
        FROM dist_app.posts p
        LEFT JOIN dist_app.comments c ON c.post_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at ASC
    `);
    res.json(result.rows);
});

app.post('/events', (req, res) => {
    res.json({});
});

app.listen(5002, '0.0.0.0', () => {
    console.log('Query service.');
    console.log('App is started at http://localhost:5002');
});
