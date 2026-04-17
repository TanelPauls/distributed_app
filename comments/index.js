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

app.get('/posts/:id/comments', async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM dist_app.comments WHERE post_id = $1 ORDER BY created_at ASC',
        [req.params.id]
    );
    res.json(result.rows.map(row => ({
        id: row.id,
        postId: row.post_id,
        content: row.content,
        status: row.status,
    })));
});

app.post('/posts/:id/comments', async (req, res) => {
    const result = await pool.query(
        'INSERT INTO dist_app.comments (post_id, content) VALUES ($1, $2) RETURNING *',
        [req.params.id, req.body.content]
    );
    const row = result.rows[0];
    const comment = { id: row.id, postId: row.post_id, content: row.content, status: row.status };

    try {
        await axios.post('http://event-bus:5005/events', {
            type: 'CommentCreated',
            data: comment
        });
    } catch (err) {
        console.log('Error sending event to event bus', err.message);
    }

    res.status(201).json(comment);
});

app.post('/events', async (req, res) => {
    const { type, data } = req.body;
    if (type === 'CommentModerated') {
        const { id, postId, status, content } = data;
        const result = await pool.query(
            'UPDATE dist_app.comments SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        try {
            await axios.post('http://event-bus:5005/events', {
                type: 'CommentUpdated',
                data: { id, postId, content, status }
            });
        } catch (err) {
            console.log('Error sending CommentUpdated', err.message);
        }
    }
    res.json({});
});

app.listen(5001, '0.0.0.0', () => {
    console.log('Comments service.');
    console.log('App is started at http://localhost:5001');
});
