const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

app.post('/events', async (req, res)=> {
    const event = req.body;

    try {
        await axios.post('http://posts:5000/events', event);
    } catch (err) {
        console.log('Error forwarding to posts service', err.message);
    }

    try {
        await axios.post('http://comments:5001/events', event);
    } catch (err) {
        console.log('Error forwarding to comments service', err.message);
    }

    try {
        await axios.post('http://query:5002/events', event);
    } catch (err) {
        console.log('Error forwarding to query service', err.message);
    }

    try {
        await axios.post('http://moderation:5003/events', event);
    } catch (err) {
        console.log('Error forwarding to moderation service', err.message);
    }

    res.json({status: 'ok'});
});

app.listen(5005, "0.0.0.0", () => {
    console.log('event-bus service.');
    console.log('App is started at http://localhost:5005');
});