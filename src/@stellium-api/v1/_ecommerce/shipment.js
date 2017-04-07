const express = require('express');
const Model = require('../../../.././Ecommerce/Shipment');

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
 * Get all shipments
 */
router.get('/', function(req, res, next) {
    Model.find({}, function(err, users) {
        if (err) res.send('Error retrieving users');
        else res.send(users);
    });
});

/**
 * Get a single shipment based on it's ID
 */
router.get('/:modelId', function(req, res, next) {
    Model.findById(req.param('modelId'), function(err, user) {
        res.send(user);
    });
});

/**
 * Creates a new shipment
 */
router.post('/', function(req, res, next) {
    Model.create(req.body, function(err, user) {
        if (err) return console.log(err);
        res.send({
            message: 'User successfully create',
            user: user
        });
    });
});

/**
 * Updates a shipment based on it's id
 */
router.patch('/:modelId', function(req, res, next) {
    res.send('Attempting to patch a user');
});

/**
 * Deletes a shipment based on it's id
 */
router.delete('/:modelId', function(req, res, next) {
    Model.findById(req.param('modelId'), function(err, user) {
        if (err) return console.log('Error deleting user', err);
        user.remove();
        res.send('User deleted');
    });
});

module.exports = router;
