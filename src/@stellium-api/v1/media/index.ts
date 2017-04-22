import * as express from 'express'
import {FolderRouter} from './folder'
// import {FilesRouter} from './file'
import {MediaMediaRouter} from './media'
import {Router} from 'express'
import {MediaFileRouter} from './file/index'


export const MediaBundleRouter: Router = express.Router()

MediaBundleRouter.use('/files', MediaFileRouter)

MediaBundleRouter.use('/folders', FolderRouter)

MediaBundleRouter.use('/media', MediaMediaRouter)
