// import * as colors from 'colors';
import * as redis from 'redis';
import {LanguageKeys, translateCacheUrl} from "../../@stellium-common";
const redisClient = redis.createClient()


export const PageCacheMiddleware = (req, res, next) => {

    const lang = req.app.get(LanguageKeys.CurrentLanguage)

    const url = req.url.replace(/^\/+|\/+$/g, '')

    // Cache key where the content is store in redis
    let cachedKey = translateCacheUrl(lang, url)

    // append `_hot` keyword for hot reloaded content
    if (req.query.hot) cachedKey += '_hot'

    redisClient.get(cachedKey, (err, cachedPage) => {

        if (!cachedPage) {
            next()
            return
        }

        // Page exists in cache, return cached version
        res.send(cachedPage)
    })
}
