const express = require('express');
const cors = require('cors');
// const axios = require('axios');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

const posts = {};

app.get('/posts', (req,  res) => {
    res.send(posts);
})

app.post('/events', (req,res) => {

    if (req.body.type === 'PostCreated') {
        const {id, title} = req.body.data;
        posts[id] = { id, title, comments: []};
    }

    if (req.body.type === 'CommentCreated') {
        const {id, content, postId} = req.body.data;
        const post = posts[postId];

        if (post) {
            post.comments.push({id, content});
        }
    }

    if (req.body.type === 'CommentUpdated') {
        const { id, postId, status, content } = req.body.data;
        const post = posts[postId];

        if (post) {
            const comment = post.comments.find(c => c.id === id);

            if (comment) {
                comment.status = status;
                comment.content = content;
            }
        }
    }

    console.log(posts);
    res.json({ });
});


app.listen(5002, "0.0.0.0", () => {
        console.log('Query service.');
        console.log('App is started at http://localhost:5002');
    });