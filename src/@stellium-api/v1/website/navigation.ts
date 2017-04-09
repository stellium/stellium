import * as express from 'express'
import {Router} from 'express'
import {WebsiteNavigationModel} from '@stellium-database'
import {Monolog} from '@stellium-common'


export const WebsiteNavigationRouter: Router = express.Router();


WebsiteNavigationRouter.get('/', (req, res) => {

    WebsiteNavigationModel.find({}, (err, navigation) => {

        if (err) {
            res.send('Error retrieving navigation items');
            Monolog({
                message: 'Error retrieving navigation items',
                error: err
            });
            return;
        }

        res.send(navigation);
    });
});


WebsiteNavigationRouter.get('/:modelId', (req, res, next) => {

    WebsiteNavigationModel.findById(req.params.modelId, (err, user) => {

        res.send(user);
    });
});


WebsiteNavigationRouter.post('/', (req, res, next) => {

    WebsiteNavigationModel.create(req.body, (err, navigation) => {

        if (err) {
            res.status(500).send('Error creating navigation');
            Monolog({
                message: 'Error creating new navigation object',
                error: err
            });
            return;
        }

        res.send(navigation);
    });
});


WebsiteNavigationRouter.put('/:modelId', (req, res, next) => {

    res.send('Attempting to patch a user');
});


WebsiteNavigationRouter.delete('/:modelId', (req, res, next) => {

    WebsiteNavigationModel.findById(req.params.modelId, (err, user) => {

        if (err) {
            res.status(500).send('Failed finding navigation item');
            Monolog({
                message: 'MongoDB failed finding navigation model by id',
                error: err
            });
            return;
        }

        if (!user) {
            next();
            return;
        }

        user.remove(err => {

            if (err) {
                res.status(500).send('Error deleting navigation item');
                Monolog({
                    message: 'Error deleting navigation item',
                    error: err
                });
                return;
            }

            res.send('Navigation has been deleted');
        });
    });
});
