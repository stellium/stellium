import * as express from 'express'
import {Router} from 'express'
import {folderDeleteController} from './delete_folder'
import {folderCreateController} from './create_folder'
import {folderRenameController} from './rename_folder'


export const FolderRouter: Router = express();

FolderRouter.post('/', folderCreateController)

FolderRouter.put('/', folderRenameController)

FolderRouter.delete('/:folderUrl', folderDeleteController)
