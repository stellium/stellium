import * as glob from 'glob';
import * as express from 'express';
import {Router} from "express";
import {MediaFileModel} from "../../../@stellium-database";
import {MediaPath, Monolog} from "../../../@stellium-common";


export const MediaMediaRouter: Router = express.Router();


MediaMediaRouter.get('/', (req, res) => {


    // Media
});


MediaMediaRouter.post('/', (req, res) => {

    if (req.body.dir.includes('..')) return res.status(500).send('Path may not contain walkers e.g: `..`');

    let options = req.body,
        _dir = ('/' + options.dir + '/').replace(/\/\/+/g, '/'),
        targetDir = MediaPath + _dir + '*/';

    glob(targetDir, (err, _folders) => {

        if (err) {

            Monolog({
                message: 'Error index media folder prior to posting',
                error: err
            });

            res.status(500).send('An error occurred while reindexing the media directory')

        } else {

            let __folders = [];

            _folders.forEach(folder => {

                let _url = folder.replace(MediaPath, '').replace(/^\/|\/$/g, ''),
                    _titleChunk = _url.split('/'),
                    _title = _titleChunk[_titleChunk.length - 1];

                __folders.push({
                    title: _title,
                    url: _url
                });
            });

            let _dirPointer = _dir === '/' ? '/' : _dir.replace(/\/$/, '');

            MediaFileModel.find({folder: _dirPointer}, (err, files) => {

                if (err) {

                    Monolog({
                        message: 'Error finding File object',
                        error: err
                    });

                    res.status(500).send('An error occurred while trying to find the file object');

                } else {

                    res.send({
                        folders: __folders,
                        files: files
                    });
                }
            });
        }
    });
});


MediaMediaRouter.put('/', (req, res) => {

    MediaFileModel.findById(req.params.modelId, (err, file) => {

        if (err) {

            Monolog({
                message: 'Error updating a file object',
                error: err
            });

            return res.status(500).send('Error updating file. Please try again in a moment.')
        }

        file.title = req.body.title;
        file.description = req.body.description;
        file.updated_at = new Date;

        file.save((err, file) => {

            if (err) {

                Monolog({
                    message: 'Error saving file metadata',
                    error: err
                });

                res.status(500).send('Error updating file. Please try again in a moment.');

            } else res.send('File ' + file.title + ' updated successfully');
        });
    });
});
