const express = require('express');
const leadsRoute = require('./Lead');
const invoicesRoute = require('./Invoice');
const projectsRoute = require('./Project');

const app = express();

app.use('/leads', leadsRoute);

app.use('/invoices', invoicesRoute);

app.use('/projects', projectsRoute);

module.exports = app;
