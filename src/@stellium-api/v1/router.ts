import * as express from 'express'
import * as ejwt from 'express-jwt'
import {Router} from 'express'
import {ENV} from '../../@stellium-common'
import {MediaBundleRouter} from './media'
import {StelliumRouter} from './stellium/template_renderer'
import {DynamicApiRouter} from './dynamic_router'
import {ApiCacheMiddleware} from './resource_cache'
import {DashboardRouter} from "./dashboard/index";
import {SystemBundleRouter} from "./system/index";


export const V1Router: Router = express.Router();

V1Router.use(ejwt({secret: ENV.secret}))

V1Router.use('/matter-stellium', StelliumRouter)

V1Router.use(ApiCacheMiddleware)

V1Router.use('/dashboard', DashboardRouter)

V1Router.use('/media', MediaBundleRouter)

V1Router.use('/system', SystemBundleRouter)

V1Router.use(DynamicApiRouter)
