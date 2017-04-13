import * as express from 'express'
// import {WebsiteNavigationRouter} from './navigation'
import {Router} from 'express'
import {WebsitePagesRouter} from './pages'


export const WebsiteBundleRouter: Router = express.Router()

WebsiteBundleRouter.use('/pages', WebsitePagesRouter)
// WebsiteBundleRouter.use('/navigation', WebsiteNavigationRouter);
