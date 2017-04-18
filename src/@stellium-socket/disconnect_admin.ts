import * as redis from 'redis'
import {ENV, CacheKeys} from '../@stellium-common'
import {GetOnlineAdmins} from './controllers/online_admins'


const redisClient = redis.createClient({db: ENV.redis_index})


export const DisconnectAdmin = (client): void => {

    const adminId = client.handshake.query['user_id']

    redisClient.del(CacheKeys.AdminIDPrefix + adminId, err => {

        /**
         * TODO(fix): Error Handling
         * @date - 4/15/17
         * @time - 11:30 AM
         */

        GetOnlineAdmins(client)
    })
}