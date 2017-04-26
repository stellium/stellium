import * as path from 'path'
import * as multer from 'multer'
import * as mkdirp from 'mkdirp'
import * as express from 'express'
import {Router} from 'express'
import {StoragePath} from '../../../../@stellium-common'
import {fileUsageCheck} from './file_usage_check'
import {deleteFile} from './delete_file'
import {indexFile} from './index_file'
import {uploadFile} from './upload_file'
import {getFileById} from './get_single_file'
import {uploadProfilePicture} from './user_profile_picture'


const TempPath = path.resolve(StoragePath, '.tmp')

const storage = multer.diskStorage({
    // Temporary destination for file uploads
    destination: (req, file, cb) => mkdirp(TempPath, err => cb(err, TempPath))
})

const upload = multer({storage: storage})


export const MediaFileRouter: Router = express.Router()


/**
 * TODO(opt): Move to dynamic routes
 * @date - 4/21/17
 * @time - 5:40 PM
 */
MediaFileRouter.get('/', indexFile)

MediaFileRouter.get('/usage', fileUsageCheck)

MediaFileRouter.post('/', upload.single('file'), uploadFile)

MediaFileRouter.post('/profile-picture', upload.single('file'), uploadProfilePicture)

/**
 * TODO(opt): Move to dynamic routes
 * @date - 4/21/17
 * @time - 5:40 PM
 */
MediaFileRouter.get('/:fileId', getFileById)

// MediaFileRouter.patch('/:fileId', null)

MediaFileRouter.delete('/:fileId', deleteFile)
