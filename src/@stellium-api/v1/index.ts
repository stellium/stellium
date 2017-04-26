import * as express from 'express'
import * as ejwt from 'express-jwt'
import {Router} from 'express'
import {ENV, Monolog} from '../../@stellium-common'
import {SystemUserModel} from '../../@stellium-database'
import {MediaBundleRouter} from './media'
import {StelliumRouter} from './stellium'
import {DynamicApiRouter} from './dynamic_router'
import {ApiCacheMiddleware} from './resource_cache'
import {WebsiteBundleRouter} from './website/index'
import {CustomCollectionRouter} from './custom_collection/index'
import {AnalyticsRouter} from './analytics/index'
import {UsersRouter} from './users/index'
import {SystemSettingsRouter} from './settings/index'
import {BlogBundleRouter} from './blog/index'


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

V1Router.use('/analytics', AnalyticsRouter)

V1Router.use('/custom-collection', CustomCollectionRouter)

V1Router.use('/media', MediaBundleRouter)

V1Router.use('/users', UsersRouter)

V1Router.use('/blog', BlogBundleRouter)

V1Router.use('/settings', SystemSettingsRouter)

V1Router.use('/website', WebsiteBundleRouter)

V1Router.use(DynamicApiRouter)
