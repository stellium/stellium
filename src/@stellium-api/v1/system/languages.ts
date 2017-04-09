import * as express from 'express'
import {LanguageModel} from '../../../../../Database/Models/System/Language'


export const LanguageRouter = express.Router();


LanguageRouter.get('/', (req, res) => {

    LanguageModel.find({}, (err, languages) => {

        if (err) res.send('Error retrieving users');
        else res.send(languages);
    });
});


LanguageRouter.get('/:modelId', (req, res) => {
    LanguageModel.findById(req.params.modelId, (err, user) => {
        res.send(user);
    });
});
