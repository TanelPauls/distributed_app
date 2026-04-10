const express = require('express');
const { randomBytes } = require('node:crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

const posts = [];


app.get('/posts', (req,res) => {
    res.json(posts);
 })

app.post('/posts', async (req,res) =>{
    const id = randomBytes(4).toString('hex');
    const title = req.body.title;
    const post = {
        id: id,
        title
    };
    posts.push(post);

    axios.post('http://event-bus:5005/events', {
        type: 'PostCreated',
        data: post
    }).catch((err) => {
        console.log('Error sending event to event bus', err.message);
    });

    res.status(201).json({
        post: post
    });
});

app.post('/events', (req,res) => {
    res.json({ });
});


app.listen(5000, "0.0.0.0", () => {
        console.log('Posts service.');
        console.log('App is started at http://localhost:5000');
    });