import * as redis from 'redis'
import {ENV, CacheKeys, Monolog} from '../@stellium-common'


const redisClient = redis.createClient({db: ENV.redis_index})

export const GetAdminClientSocketId = (userId: string, cb: (err: any, socketId: string) => void): void => {

    redisClient.get(CacheKeys.AdminIDPrefix + userId, (err, socketId) => {

        if (err) {
            Monolog({
                message: 'Error retrieving admin client socket ID for ' + userId,
                error: err
            })
        }

        cb(err, socketId)
    })
}