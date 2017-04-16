import * as redis from 'redis'
import {Monolog, ENV} from '../../@stellium-common'
import {NextFunction, Request, RequestHandler, Response} from 'express'
import {CacheKeys} from '../../@stellium-common'


const redisClient = redis.createClient()


export const CacheQueryResult = (req: Request, data: any) => {

    redisClient.select(ENV.redis_index, err => {

        if (err) {
            Monolog({
                message: 'Unable to select redis database at index ' + ENV.redis_index,
                error: err,
                severity: 'severe'
            })
            return
        }

        redisClient.set(CreateCacheKeyFromRequest(req), JSON.stringify(data))
    })
}


export const GetQueryDataFromCache = (req: Request, cb: (err: any, cachedData?: any) => void): void => {

    const cacheKey = CreateCacheKeyFromRequest(req)

    redisClient.select(ENV.redis_index, err => {

        if (err) {
            Monolog({
                message: 'Unable to select redis database at index ' + ENV.redis_index,
                error: err,
                severity: 'severe'
            })
            cb(err)
            return
        }

        redisClient.get(cacheKey, (err, cachedData) => cb(err, cachedData))
    })
}


export const CreateCacheKeyFromRequest = (req: Request, userUnique: boolean = true) => {

    const url = req.originalUrl

    // Strip `/v1/api/` from the full url
    // e.g. /v1/api/blog/posts => blog/posts
    // the first slash is optional, just in case it get's missed
    const apiLessUrl = url.replace(/^\/?api\/v1\//, '')

    // Convert slashes to underscore
    // e.g blog/posts => blog_posts
    let cacheKey = 'resource_cache_' + apiLessUrl.replace(/\//g, '_')

    if (userUnique) {
        cacheKey = cacheKey + '_' + req.user.role_id
    }

    return cacheKey
}


export const ClearCacheValueByRequest = (req: Request, modelNames?: string[]) => {

    const cacheKey = CreateCacheKeyFromRequest(req)

    // resource_cache_blog_posts_somePostIdButThisIsOption => [resource, cache, blog, posts]
    // because we are omitting the postId, whether it exists or not (e.g. resource_cache_blog_posts)
    // we can delete all cached starting with resource_cache_blog_posts
    // which will target a collection or a single document cached in redis
    const [r, c, group, model] = cacheKey.split('_')

    redisClient.select(ENV.redis_index, err => {

        if (err) {
            Monolog({
                message: 'Unable to select redis database at index ' + ENV.redis_index,
                error: err,
                severity: 'severe'
            })
            return
        }

        // Deletes all index and single collection cache
        // from redis as data has been changed
        redisClient.keys(`${r}_${c}_${group}_${model}*`, (err, keys) => {
            keys.forEach(_key => redisClient.del(_key))
        })

        if (modelNames) {

            const flattenedModelNames = modelNames.filter((value, index, self) => self.indexOf(value) === index)

            flattenedModelNames.forEach(_name => {

                redisClient.keys(`*${_name}*`, (err, keys) => {

                    console.log('`*${_name}*`', `*${_name}*`)

                    keys.forEach(_key => redisClient.del(_key))
                })
            })
        }
    })
}


export const ApiCacheMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {

    // Only cache GET methods, so we ignore other methods and skip the cache check
    if (req.method !== 'GET') {
        next()
        return
    }

    GetQueryDataFromCache(req, (err, cachedData) => {

        // An error occurred while attempting to communicate with redis or no data was cached for the query
        if (err || !cachedData) {

            // if it was an error, log it with Monolog
            if (err) {
                Monolog({
                    message: 'Error while attempting to retrieve API resources from cache',
                    error: err
                })
            }
            // attempt to query request in the corresponding controller
            next()
            return
        }

        res.send(JSON.parse(cachedData))
    })
}

export const DeletePageCache = () => {

    // Scans all keys for cached page documents
    redisClient.keys(CacheKeys.PageCachePrefix + '*', (err, keys) => {

        // Loops through the matching keys and delete one-by-one
        // this is only necessary when creating or editing pages and blog posts
        // to make sure no obsolete pages are served to the visitors
        keys.forEach(_key => redisClient.del(_key, err => {

            if (err) {
                // Log error if delete operation fails
                Monolog({
                    message: 'Error occurred while attempting to delete page cache for ' + _key,
                    error: err
                })
            }
        }))
    })
}
