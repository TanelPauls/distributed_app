const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const loginRoute = require('./controllers/login.js');
const getMeRoute = require('./controllers/getMe.js');
const refreshRoute = require('./controllers/refresh.js');
const logoutRoute = require('./controllers/logout.js');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use(cookieParser());

app.use(loginRoute);
app.use(getMeRoute);
app.use(refreshRoute);
app.use(logoutRoute);

app.listen(5006, '0.0.0.0', () => {
    console.log('Comments service.');
    console.log('App is started at http://localhost:5006');
});