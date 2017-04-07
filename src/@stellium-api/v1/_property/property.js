const express = require('express');
const moment = require('moment');

const google = require('../../../.././google.api');
const Model = require('../../../.././Property/Property');

const router = express.Router();

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
 * Get all properties
 */
router.get('/', function (req, res, next) {
    Model.find({}).populate({
        path: 'bookings',
        match: {
            $or: [
                {
                    check_out: {$gte: moment(), $lte: moment().add(30, 'days')}
                },
                {
                    check_in: {$gte: moment(), $lte: moment().add(30, 'days')}
                }
            ]
        }
    }).exec((err, properties) => {
        if (err) res.send('Error retrieving users');
        else res.send(properties);
    });
});

/**
 * Get a single property based on it's ID
 */
router.get('/:modelId', function (req, res, next) {
    Model.findById(req.param('modelId'), function (err, user) {
        res.send(user);
    });
});

/**
 * Creates a new property
 */
router.post('/', function (req, res, next) {

    var property = req.body;

    google.auth.authorize((err, token) => {
        if (err) console.log('Error authenticating Google APIs', err);

        google.calendar.calendars.insert(
            {
                auth: google.auth,
                resource: {
                    summary: property.title,
                    timeZone: 'Asia/Makassar'
                }
            },
            null, (err, _cal) => {
                if (err) return console.log(err);

                property.user = req.user._id;
                property.google_calendar_url = _cal.id;

                Model.create(property, (err) => {
                    if (err) return console.log(err);
                    res.send({
                        message: 'Property successfully create',
                        data: property
                    });
                });
            });
    });
});

/**
 * Updates a property based on it's id
 */
router.patch('/:modelId', function (req, res, next) {
    res.send('Attempting to patch a user');
});

/**
 * Deletes a property based on it's id
 */
router.delete('/:modelId', function (req, res, next) {
    Model.findById(req.param('modelId'), function (err, user) {
        if (err) return console.log('Error deleting user', err);
        user.remove();
        res.send('User deleted');
    });
});

module.exports = router;
