import * as express from 'express'
import {Router} from 'express'
import {GoogleAnalyticsController} from './google_analytics_controller'


export const AnalyticsRouter: Router = express.Router()

AnalyticsRouter.get('/', GoogleAnalyticsController)
