import * as express from 'express'
import {Router} from 'express'
import {AnalyticsRouter} from './analytics'


export const DashboardRouter: Router = express.Router()

DashboardRouter.use('/analytics', AnalyticsRouter)
