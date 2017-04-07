const express = require('express');
const bookingsRoute = require('./booking');
const propertiesRoute = require('./property');

const app = express();

app.use('/bookings', bookingsRoute);

app.use('/properties', propertiesRoute);

module.exports = app;
