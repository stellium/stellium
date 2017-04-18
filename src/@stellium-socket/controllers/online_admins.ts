import * as redis from 'redis'
import {ENV, CacheKeys, SocketEventKeys} from '../../@stellium-common'


const redisClient = redis.createClient({db: ENV.redis_index})


export const GetOnlineAdmins = (socket): void => {

    redisClient.keys(CacheKeys.AdminIDPrefix + '*', (err, keys) => {

        socket.emit(SocketEventKeys.OnlineAdminCount, keys.length)
    })
}