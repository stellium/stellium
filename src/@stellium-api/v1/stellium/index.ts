import {Router} from 'express'
import * as express from 'express'
import {StelliumTemplateRouter} from './template_renderer'
import {StelliumCacheRouter} from './invoke_cache'

export const StelliumRouter: Router = express.Router()


StelliumRouter.use(StelliumTemplateRouter)

StelliumRouter.use(StelliumCacheRouter)
