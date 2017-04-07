const express = require('express');
const messagesRoute = require('./chat');

const app = express();

app.use('/messages', messagesRoute);

module.exports = app;
