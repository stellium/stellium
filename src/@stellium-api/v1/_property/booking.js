const express = require('express');
const moment = require('moment');
const router = express.Router();

const Booking = require('../../../.././Property/Booking');

/**
 * Resource map:
 * | Verb       | Path                          | Action    | Route Name    |
 * --------------------------------------------------------------------------
 * | GET        | /{model}                      | index     | model.index   |
 * | POST       | /{model}                      | store     | model.store   |
 * | GET        | /{model}/{model_id}           | show      | model.show    |
 * | PATCH      | /{model}/{model_id}           | update    | model.update  |
 * | DELETE     | /{model}/{model_id}           | destroy   | model.destroy |
 * --------------------------------------------------------------------------
 */

/**
 * Get all bookings
 */
router.get('/', function (req, res) {
    Booking.find({}, function (err, bookings) {
        if (err) res.send({
            status: 500,
            error: err.errors
        });
        else res.send({
            status: 200,
            message: 'Bookings retrieved',
            data: bookings
        });
    });
});

/**
 * Get a single booking based on it's ID
 */
router.get('/:propertyId', function (req, res) {

    let user = req.user._doc,
        userRole = user.role_id,
        query = {
            property: req.param('propertyId'),
            check_out: {$gte: moment().format()}
        };
    if (userRole == 2) query['user'] = user._id;

    Booking.find(query, function (err, bookings) {
        if (err) res.send({
            status: 500,
            error: err.errors
        });
        else res.send({
            status: 200,
            message: 'Bookings successfully retrieved',
            data: bookings
        });
    });
});

/**
 * Creates a new booking
 */
router.post('/', function (req, res) {

    let bookingItem = req.body;
    console.log(req.user._doc._id);
    bookingItem.user = req.user._doc._id;
    bookingItem.check_in = moment(bookingItem.check_in).format();
    bookingItem.check_out = moment(bookingItem.check_out + 'T' + bookingItem.checkout_time).format();

    Booking.create(req.body, function (err, booking) {
        if (err) res.send({
            status: 500,
            error: err
        });
        else res.send({
            status: 200,
            message: 'Booking successfully created',
            data: booking
        });
    });
});

/**
 * Updates a booking based on it's id
 */
router.patch('/:modelId', function (req, res) {
    Booking.findOneAndUpdate({_id: req.param('modelId')}, req.body, (err, booking) => {
        if (err) res.send({
            status: 500,
            error: err.errors
        });
        else res.send({
            status: 200,
            message: 'Booking has been updated',
            data: booking
        });
    });
});

/**
 * Deletes a booking based on it's id
 */
router.delete('/:bookingId', function (req, res) {
    //noinspection TypeScriptValidateTypes
    Booking.remove({_id: req.param('bookingId')}, (err, booking) => {
        if (err) res.send({
            status: 500,
            error: err.errors
        });
        else res.send({
            status: 200,
            message: 'Booking has been deleted',
            data: booking
        });
    });
});

module.exports = router;
