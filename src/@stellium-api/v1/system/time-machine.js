const express = require('express');
const TimeMachine = require('../../../.././System/TimeMachine');

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
 * Get all time objects based on the model_ref
 */
router.get('/:modelType/:modelId', (req, res) => {


    let _query = {
        model_type: req.params['modelType'],
        model_ref: req.params['modelId']
    };

    TimeMachine.find(_query).lean().exec((err, timeMachineObjects) => {

        if (err) return res.status(500).send('There was an error indexing the time machine history');

        timeMachineObjects.forEach((_timeObject, index) => {
            /** Assign order variable for easier iteration on the client's TimeMachine Explorer */
            _timeObject['order'] = (index + 1);
        });

        res.send(timeMachineObjects);
    });
});

/**
 * Get a single user based on it's ID
 */
router.get('/:modelType/:modelId/:timeStamp', (req, res) => {

    let query = {
        model_ref: req.params['modelId'],
        model_type: req.params['modelType']
    };

    TimeMachine.findOne(query, (err, history_object) => {

        res.send(history_object);
    });
});

module.exports = router;
