import * as redis from 'redis'
import {Monolog, CacheKeys, ENV} from '../../@stellium-common'
import {SystemSettingsModel} from '../../@stellium-database'


const redisClient = redis.createClient({db: ENV.redis_index})


/**
 * Setup the current, default and available languages and saves them into the memory
 * @constructor
 * @param req
 * @param res
 * @param next
 */
export const SystemSettingsMiddleware = (req, res, next): void => {

    redisClient.get(CacheKeys.SettingsKey, (err, stringSettings) => {

        if (err) {
            Monolog({
                message: 'Error retrieving cache from settings.',
                error: err
            })
        }

        if (stringSettings) {
            req.app.set(CacheKeys.SettingsKey, JSON.parse(stringSettings))
            next()
            return
        }

        SystemSettingsModel.find({}).lean().exec((err, settings) => {

            if (err) {
                res.status(500).send('An error occurred while rendering this page')
                Monolog({
                    message: 'Error while retrieving system settings for request.',
                    error: err
                })
                return
            }

            redisClient.set(CacheKeys.SettingsKey, JSON.stringify(settings), err => {

                if (err) {
                    Monolog({
                        message: 'Error caching system settings.',
                        error: err
                    })
                }

                req.app.set(CacheKeys.SettingsKey, settings)
                next()
            })
        })
    })
}
