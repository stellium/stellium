import * as fs from 'fs'
import * as path from 'path'
import * as imageSize from 'image-size'
import {Monolog, MediaPath} from '../../../../@stellium-common'
import {MediaFileModel} from '../../../../@stellium-database'
import {getFileExtension} from './_lib'


/**
 *
 * Checks for existing file with the same file name. If a file with the same name exists, return null in callback
 * @param path
 * @param cb
 * @constructor
 */
const checkForConflictingFile = (path: string, cb?: (err: any) => void): void => {

    fs.access(path, err => {

        if (err) {

            if (err.code === 'ENOENT') {
                cb(null)
                return
            }

            cb(err)
            Monolog({
                message: 'Unknown error when checking for conflicting file',
                error: err
            })
            return
        }
        // There is no error so a conflicting file exists, force error in callback
        cb(true)
    })
}


export const uploadFile = (req, res) => {

    if (!req.file) {
        res.status(309).send('Missing file object in request')
        Monolog({
            message: 'The user somehow managed to POST to files without a File object'
        })
        return
    }

    // Current directory where user is uploading from
    let targetDir = req.body['current_dir'].replace(/^\/+|\/+$/g, '')

    // File name
    let file_name = req.body['filename']

    // File title defaults to file name if not title given
    let file_title = req.body['title'] || file_name

    // Path where the uploaded file is to be stored
    let newPath = path.resolve(MediaPath, targetDir, file_name)

    console.log('newPath', newPath)

    /**
     *
     * Check for conflicting files in the media directory
     */
    checkForConflictingFile(newPath, err => {

        if (err) {
            /**
             * TODO(boris): Instead of returning an error, return file name automatically
             * @date - 17 Jan 2017
             * @time - 1:25 PM
             */
            res.status(309).send('A file with the same name already exists. Please change your file\'s name and try again.')
            return
        }

        fs.rename(req.file.path, newPath, err => {

            if (err) {
                Monolog({
                    message: 'Error renaming temp file to targeted directory',
                    error: err
                })
                res.status(500).send('Internal Server Error')
                return
            }

            let folderDest = newPath.replace(MediaPath, '').replace(file_name, '')

            const dimensions = imageSize(newPath)

            const containingFolder = folderDest === '/' ? '/' : folderDest.replace(/\/$/g, '')

            const fileMetadata = {
                url: newPath.replace(MediaPath, '').replace(/^\//, ''),
                title: file_title,
                folder: containingFolder,
                type: getFileExtension(req.file.mimetype),
                width: dimensions.width,
                height: dimensions.height,
                description: req.body['description'] || {en: file_title},
                trash_name: null,
                user_id: req.user._id,
                // set with fs.stat
                size: undefined,
            }

            fs.stat(newPath, (err, file) => {

                fileMetadata.size = file.size

                MediaFileModel.create(fileMetadata, err => {

                    if (err) {
                        Monolog({
                            message: 'Error saving file metadata while uploading a new file',
                            error: err
                        })
                        fs.unlinkSync(newPath)
                        res.status(500).send('Internal Server Error')
                        return
                    }

                    res.send({message: 'File saved successfully!'})
                })
            })
        })
    })
}
