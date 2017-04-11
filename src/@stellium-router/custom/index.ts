import * as express from 'express'
import {Router} from 'express'
import {CustomRouteBundle} from './growbali/index'


export const CustomRoutesMiddleware: Router = express.Router()

CustomRoutesMiddleware.use(CustomRouteBundle)
