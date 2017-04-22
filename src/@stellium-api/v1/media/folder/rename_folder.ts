import * as fs from 'fs'
import * as path from 'path'
import {Monolog, MediaPath} from '../../../../@stellium-common'


export const folderRenameController = (req, res) => {

    // Old path to be renamed
    let folderName = req.body.old_path

    // New path name
    let newPath = req.body.new_path

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

        res.send({
            message: `Folder ${folderName} has been renamed to ${newPath} successfully`
        })
    })
}
