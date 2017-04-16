import * as express from 'express'
import * as ejwt from 'express-jwt'
import {Router} from 'express'
import {ENV, Monolog} from '../../@stellium-common'
import {MediaBundleRouter} from './media'
import {StelliumRouter} from './stellium'
import {DynamicApiRouter} from './dynamic_router'
import {ApiCacheMiddleware} from './resource_cache'
import {DashboardRouter} from './dashboard/index'
import {SystemBundleRouter} from './system/index'
import {WebsiteBundleRouter} from './website/index'
import {SystemUserModel} from '../../@stellium-database'
import {CustomCollectionRouter} from './custom_collection/index'


export const V1Router: Router = express.Router();

V1Router.use(ejwt({secret: ENV.secret}))

V1Router.use((req, res, next) => {

    next()

    SystemUserModel.findByIdAndUpdate(req.user._id, {last_login: new Date}, (err, user) => {
        if (err) {
            Monolog({
                message: 'Failed updating user\'s last login timestamp',
                error: err,
                severity: 'moderate'
            })
        }
    })
})

V1Router.use('/matter-stellium', StelliumRouter)

V1Router.use(ApiCacheMiddleware)

V1Router.use('/dashboard', DashboardRouter)

V1Router.use('/custom-collection', CustomCollectionRouter)

V1Router.use('/media', MediaBundleRouter)

V1Router.use('/system', SystemBundleRouter)

V1Router.use('/website', WebsiteBundleRouter)

V1Router.use(DynamicApiRouter)
