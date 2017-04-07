import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as express from 'express';
import {MediaPath, Monolog} from "../../../@stellium-common";
import {Router} from "express";


export const FolderRouter: Router = express();


// FolderRouter.get('/', (req, res) => {
//     glob(MediaPath + '/*/', (err, folders) => {
//         if (err) {
//             res.status(500).send('A server error occurred.')
//             Monolog({
//                 message: 'Error indexing media directory',
//                 error: err
//             })
//         } else {
//             folders = folders.map(_folder => _folder.replace(MediaPath, ''))
//             res.send(folders)
//         }
//     })
// })


FolderRouter.post('/', (req, res) => {

    let current_dir = req.body['current_path'],
        new_dir = req.body['new_path'];

    if (current_dir.includes('..')) {

        res.status(401).send('Attempting to access restricted directory with `..`. You\'ve gotta be smarter than that. ;)')

        // Folder names cannot contain walkers `../..`. Not allowed as this is a potentially dangerous backdoor to
        // access restricted files / folders
        Monolog({
            message: 'Attempting to access out of scope directory with `..`',
            severity: 'moderate'
        })
        return
    }

    if (new_dir.includes('/')) {

        // Folders names cannot contain slashes, that would create a nested folder, not allowed through the file manager
        res.status(401).send('Folder names cannot contain slashes `/`')
        return
    }


    mkdirp(path.resolve(MediaPath, current_dir, new_dir), (err) => {

        if (err) {
            Monolog({
                message: 'Error while creating a folder with mkdirp',
                error: err
            })
            res.status(500).send('An error occurred while attempting to create a folder')
            return
        }

        res.send({
            message: 'Directory "' + new_dir + '" created successfully'
        })
    })
})


/**
 * TODO(boris): Not yet in effect
 * @date - 26 Jan 2017
 * @time - 1:09 PM
 */
/**
 * Rename a directory
 */
FolderRouter.put('/', (req, res) => {

    // Old path to be renamed
    let folderName = req.body['old_path']

    // New path name
    let newPath = req.body['new_path']

    // Folder names cannot contain walkers `../..`. Not allowed as this is a potentially dangerous backdoor to access
    // restricted files / folders
    if (folderName.indexOf('..') > -1) {

        res.status(401).send('Attempting to access restricted directory with `..`. You\'ve gotta be smarter than that. ;)')
        return
    }

    // Replace dashes with slashes to indicate depth
    // todo(boris): is this allowed???
    folderName = folderName.replace(/-/g, '/')

    /** Rename folder using fs' built in rename fn */
    fs.rename(path.resolve(MediaPath, folderName), path.resolve(MediaPath, newPath), (err) => {

        if (err) {
            res.status(500).send('Something went wrong while renaming the directory. Try again in ' +
                'a moment or contact your developer for assistance.')
            Monolog({
                message: 'Rename of directory operation failed miserably',
                error: err
            })
            return
        }

        res.send(newPath)
    })
})
