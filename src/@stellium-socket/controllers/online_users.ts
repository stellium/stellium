import * as redis from 'redis'
import {ENV, CacheKeys} from '../../@stellium-common'
import {SocketEventKeys} from '../../@stellium-common/keys/socket_events'

const redisClient = redis.createClient({db: ENV.redis_index})


export const GetNumberOfOnlineUsers = (socket): void => {

    redisClient.keys(CacheKeys.ClientIDPrefix + '*', (err, keys) => {

        socket.emit(SocketEventKeys.RequestUserCount, keys.length)
    })
}