import * as redis from 'redis'
import {
    LanguageKeys,
    translateCacheUrl,
    CacheKeys,
    ENV,
    Monolog
} from '../../@stellium-common'
const redisClient = redis.createClient()


export const PageCacheMiddleware = (req, res, next) => {

    const lang = req.app.get(LanguageKeys.CurrentLanguage)

    const url = req.url.replace(/^\/+|\/+$/g, '')

    // Cache key where the content is store in redis
    let cachedKey = translateCacheUrl(lang, url)

    // append `_hot` keyword for hot reloaded content
    if (req.query.hot) cachedKey += '_hot'

    redisClient.select(ENV.redis_index, err => {

        if (err) {
            Monolog({
                message: 'Unable to select redis database at index ' + ENV.redis_index,
                error: err,
                severity: 'severe'
            })
            res.status(500).send('Internal Server Error')
            return
        }

        redisClient.get(cachedKey, (err, cachedPageMeta) => {

            if (!cachedPageMeta) {
                next()
                return
            }

            const analyticsVisitor = req.app.get(CacheKeys.UAVisitor)

            analyticsVisitor && analyticsVisitor.page(req.originalUrl).send()

            if (req.query.hot) {
                res.send(JSON.parse(cachedPageMeta))
                return
            }

            // Page exists in cache, return cached version
            res.send(cachedPageMeta)
        })
    })
}
