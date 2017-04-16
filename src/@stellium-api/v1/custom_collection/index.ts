import * as express from 'express'
import {Router} from 'express'
import {CustomCollectionIndexController} from './list_collection'


export const CustomCollectionRouter: Router = express.Router()

CustomCollectionRouter.get('/', CustomCollectionIndexController)
