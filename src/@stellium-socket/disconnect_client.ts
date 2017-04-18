import * as redis from 'redis'
import {ENV, CacheKeys, Monolog} from '../@stellium-common'
import {GetNumberOfOnlineUsers} from './controllers/online_users'
import {GetPageVisitData} from './controllers/page_visit'


const redisClient = redis.createClient({db: ENV.redis_index})


export const DisconnectClient = (client, clientSessionId): void => {

    const cacheKey = CacheKeys.ClientIDPrefix + clientSessionId

    redisClient.get(cacheKey, (err, existingMeta) => {

        if (existingMeta) {

            const existingMetaObject = JSON.parse(existingMeta)

            // If the user has connected through multiple connections
            // simply reduce the connection count by one
            if (existingMetaObject.count > 1) {

                existingMetaObject.count -= 1

                redisClient.set(cacheKey, JSON.stringify(existingMetaObject), err => {

                    /**
                     * TODO(production): Error handler
                     * @date - 4/14/17
                     * @time - 3:20 AM
                     */

                    GetNumberOfOnlineUsers(client)

                    GetPageVisitData(client)
                })

                return
            }

            // If the user only has 1 active connection, completely remove
            // user connection from cache
            redisClient.del(cacheKey, err => {

                if (err) {
                    Monolog({
                        message: 'Unable to delete connected user from redis',
                        error: err
                    })
                    return
                }

                GetNumberOfOnlineUsers(client)

                GetPageVisitData(client)
            })
        }
    })
}