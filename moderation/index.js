const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

app.post('/events', (req, res) => {
    if (req.body.type === 'CommentModerated' || req.body.type ==='CommentUpdated') {
        return res.status(200).send({});
    }
    console.log('Received Event:', req.body);

    const data = req.body?.data;
    if (!data || typeof data.content !== 'string') {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    let status = data.status;

    if (status === 'pending') {
        const hasOrange = /\borange\b/i.test(data.content);

        status = hasOrange ? 'rejected' : 'approved';
    }
    const moderatedComment = {
        ...data,
        status: status
    };
    console.log(moderatedComment);

    axios.post('http://event-bus:5005/events', {
        type: 'CommentModerated',
        data: moderatedComment
    }).catch((err) => {
        console.log('Error sending event to event bus', err.message);
    });

    res.status(201).json({status});
});

app.listen(5003, "0.0.0.0", () => {
    console.log('Moderation service.');
    console.log('App is started at http://localhost:5003');
});