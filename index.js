const express = require('express');
const { randomBytes } = require('node:crypto');

const app = express();
app.use(express.json());
 const posts = [];

app.get('/posts', (req,res) => {
    res.json(posts);
 })

app.post('/posts', (req,res) =>{
    const title = req.body.title;
    const post = {
        id: randomBytes(4).toString('hex'),
        title
    };
    posts.push(post);
    res.status(201).json({
        post: post
    });
});

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
    res.status(201).json(comment);
});



app.listen(7113, "0.0.0.0", () => {
        console.log('App is started at http://localhost:7113');
    });