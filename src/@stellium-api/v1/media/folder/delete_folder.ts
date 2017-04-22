import * as path from 'path'
import * as rimraf from 'rimraf'
import {MediaFileModel} from '../../../../@stellium-database'
import {Monolog, CommonErrors} from '../../../../@stellium-common'
import {MediaPath} from '../../../../@stellium-common/path/common_paths'


export const folderDeleteController = (req, res, next) => {

    const folderUrl = req.params.folderUrl

    // To ensure that we can use nested folders as params in the request
    // we need to shim the slashes in the folder's name with triple underscores.
    // Here we convert back those _'s to slashes
    const decodedFolderUrl = folderUrl.replace('___', '/')

    // To prevent RegEx DOS attacks we need to make sure
    // strings converted to regex are less than 128 characters
    // in length
    if (decodedFolderUrl.length > 128) {
        Monolog({
            message: 'Folder URL is longer than 128 characters: ' + folderUrl
        })
    }

    const regexSearch = new RegExp(decodedFolderUrl, 'i')

    MediaFileModel.remove({url: {$regex: regexSearch}}, err => {

        if (err) {
            Monolog({
                message: 'Error removing media file documents while deleting directory ' + decodedFolderUrl,
                error: err
            })
            res.status(500).send(CommonErrors.InternalServerError)
            return
        }

        rimraf(path.resolve(MediaPath, decodedFolderUrl), err => {

            if (err) {
                Monolog({
                    message: `Error rimraf-ing folder ${decodedFolderUrl} while attempting to delete a directory`,
                    error: err
                })
                res.status(500).send('The file have been removed, but there seems to be an error while deleting the folder')
                return
            }

            res.send({
                message: `The folder ${decodedFolderUrl} has been removed successfully`
            })
        })
    })
}
