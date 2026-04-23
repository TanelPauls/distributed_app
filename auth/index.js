const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const loginRoute = require('./routes/login.js');
const getMeRoute = require('./routes/getMe.js');
const refreshRoute = require('./routes/refresh.js');
const logoutRoute = require('./routes/logout.js');
const verifyRoute = require('./routes/verify.js');

const app = express();

app.use(cors({
    origin: 'https://hajusrakendus.neiwa.eu',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use(loginRoute);
app.use(getMeRoute);
app.use(refreshRoute);
app.use(logoutRoute);
app.use(verifyRoute);

app.listen(5006, '0.0.0.0', () => {
    console.log('Comments service.');
    console.log('App is started at http://localhost:5006');
});