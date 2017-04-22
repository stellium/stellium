import * as fs from 'fs'
import * as glob from 'glob'
import * as path from 'path'
import * as multer from 'multer'
import * as mkdirp from 'mkdirp'
import * as express from 'express'
import * as imageSize from 'image-size'
import {Router} from "express"
import {MediaPath, Monolog, StoragePath} from '../../../@stellium-common'
import {MediaFileModel} from '../../../@stellium-database'
import {fileUsageCheck} from './file/file_usage_check'


export const FilesRouter: Router = express()


const TempPath = path.resolve(StoragePath, '.tmp')


const storage = multer.diskStorage({
    // Temporary destination for file uploads
    destination: (req, file, cb) => mkdirp(TempPath, err => cb(err, TempPath))
})


const upload = multer({storage: storage})


const getFileExtension = (fileName) => {
    return fileName.split('/')[1]
}


/**
 *
 * Checks for existing file with the same file name. If a file with the same name exists, return null in callback
 * @param path
 * @param cb
 * @constructor
 */
const CheckForConflictingFile = (path: string, cb?: (err: any) => void): void => {

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


FilesRouter.get('/:fileId', (req, res) => {

    MediaFileModel.findById(req.params['fileId'], (err, file) => {

        if (err) {

            Monolog({
                message: 'Failed to retrieve file document',
                error: err
            })

            res.status(500).send('Internal Server Error')

        } else res.send(file)
    })
})


/**
 * Replaces a file with a new one
 *
 */
FilesRouter.patch('/:fileId', (req, res) => {
    res.send('Attempting to patch a file')
})


const clearTempFolder = () => {

    glob(TempPath + '/*', (err, files) => {

        files.forEach(file => {

            fs.unlink(file, err => {

                if (err) {

                    Monolog({
                        message: 'Error deleting file in `clearTempFolder()`',
                        error: err
                    })
                }
            })
        })
    })
}


const checkMultipleFiles = (files, cb) => {

    files.forEach(file => {

        // TODO(boris): wrong path, here is temp path but should check final path
        let fileExist = fs.statSync(file.path)

        if (fileExist) return cb(new Error('File exists'), false)
    })

    cb(null, true)
}
