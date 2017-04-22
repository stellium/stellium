import * as path from 'path'
import * as mkdirp from 'mkdirp'
import {Monolog, MediaPath} from '../../../../@stellium-common'


export const folderCreateController = (req, res) => {

    // The directory where the new folder will be created
    let current_dir = req.body.current_path

    // The name of the folder to be created
    let new_dir = req.body.new_path

    if (new_dir.length > 32) {
        res.status(400).send('Folder names can not exceed 32 characters')
        Monolog({
            message: 'Attempting to create a folder with more than 32 characters as the name',
            severity: 'light'
        })
        return
    }

    // Checks if directory name include walkers
    if (current_dir.includes('..') || current_dir.includes('..')) {

        res.status(401).send('Attempting to access restricted directory with `..`. You\'ve gotta be smarter than that. ;)')

        // Folder names cannot contain walkers `../..`. Not allowed as this is a security hole to
        // access restricted files/folders
        Monolog({
            message: 'Attempting to access out of scope directory with `..`, operation intercepted.',
            severity: 'moderate'
        })
        return
    }

    if (new_dir.includes('/')) {
        // Folders names cannot contain slashes, that would create a nested folder, not allowed through the file manager
        res.status(401).send('Folder names cannot contain slashes `/`')
        return
    }

    // Replace white spaces with underscore
    new_dir = new_dir.replace(/\s|\s+/g, '_').toLowerCase()

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
            message: `Directory '${new_dir}' created successfully`,
            directory: new_dir
        })
    })
}
