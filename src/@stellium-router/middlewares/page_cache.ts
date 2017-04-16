import * as redis from 'redis'
import * as cheerio from 'cheerio'
import {
    LanguageKeys,
    translateCacheUrl,
    CacheKeys,
    ENV,
    Monolog,
    SettingsKeys
} from '../../@stellium-common'
const universalAnalytics = require('universal-analytics')
const redisClient = redis.createClient({db: '' + ENV.redis_index})


export const PageCacheMiddleware = (req, res, next) => {

    const lang = req.app.get(LanguageKeys.CurrentLanguage)

    const url = req.url.replace(/^\/+|\/+$/g, '')

    // Cache key where the content is store in redis
    let cachedKey = translateCacheUrl(lang, url)

    // append `_hot` keyword for hot reloaded content
    if (req.query.hot) cachedKey += '_hot'


    redisClient.get(cachedKey, (err, cachedPageMeta) => {

        if (!cachedPageMeta) {
            next()
            return
        }

        if (req.query.hot) {
            res.send()
            return
        }

        // Page exists in cache, return cached version
        res.send(cachedPageMeta)

        if (!DEVELOPMENT) {

            const systemSettings = req.app.get(CacheKeys.SettingsKey)

            const GATrackingIdSettings = systemSettings.find(_setting => _setting.key === SettingsKeys.AnalyticsTrackingID)

            if (GATrackingIdSettings) {

                universalAnalytics(GATrackingIdSettings.value, req.session.id).pageview(req.originalUrl, err => {

                    if (err) {

                        Monolog({
                            message: 'Registering visitor for analytics tracking failed',
                            error: err
                        })
                    }
                })

            } else {

                Monolog({
                    message: 'Analytics Tracking ID was not found while attempting to track analytics data',
                    error: new Error('Analytics Tracking ID Missing')
                })
            }
        }
    })
}
