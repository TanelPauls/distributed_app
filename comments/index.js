const express = require('express');
const { randomBytes } = require('node:crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

const postComments = [];

app.get('/posts/:id/comments', (req,res) => {
    res.json(postComments.filter(comment => comment.postId === req.params.id));
});

app.post('/posts/:id/comments', (req,res) => {
    const postId = req.params.id;
    const content = req.body.content;
    const comment = {
        id: randomBytes(4).toString('hex'),
        postId,
        content
    };
    postComments.push(comment);

    axios.post('http://localhost:5005/events', {
        type: 'CommentCreated',
        data: comment
    }).catch((err) => {
        console.log('Error sending event to event bus', err.message);
    });

    res.status(201).json(comment);
});

app.post('/events', (req,res) => {
    console.log('Received Event:', req.body);
    res.json({ });
});


app.listen(5001, "0.0.0.0", () => {
        console.log('App is started at http://localhost:5001');
    });