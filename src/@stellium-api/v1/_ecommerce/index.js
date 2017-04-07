const express = require('express');
const customersRoute = require('./customer');
const ordersRoute = require('./order');
const productsRoute = require('./product');
const shipmentsRoute = require('./shipment');

const app = express();

app.use('/customers', customersRoute);

app.use('/orders', ordersRoute);

app.use('/products', productsRoute);

app.use('/shipments', shipmentsRoute);

module.exports = app;
