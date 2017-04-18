import * as redis from 'redis'
import {CacheKeys, ENV} from '../@stellium-common'
import {GetNumberOfOnlineUsers} from './controllers/online_users'
import {GetOnlineAdmins} from './controllers/online_admins'
import {GetPageVisitData} from './controllers/page_visit'


const redisClient = redis.createClient({db: ENV.redis_index})


export const ClientConnectionHandler = (client, sessionId): void => {

    const clientCacheId = CacheKeys.ClientIDPrefix + sessionId

    const clientQuery = client.handshake.query

    let cacheLoad = {
        socketId: client.id,
        count: 1,
        device_type: clientQuery.device_type,
        current_page: clientQuery.current_page
    }

    redisClient.get(clientCacheId, (err, existingCache) => {

        if (existingCache) {

            const existingCacheObject = JSON.parse(existingCache)

            cacheLoad.count += existingCacheObject.count

            cacheLoad.current_page = clientQuery.current_page
        }

        redisClient.set(clientCacheId, JSON.stringify(cacheLoad), err => {

            /**
             * TODO(production): Error handling
             * @date - 4/13/17
             * @time - 11:07 PM
             */

            GetNumberOfOnlineUsers(client)

            GetOnlineAdmins(client)

            GetPageVisitData(client)
        })
    })
}