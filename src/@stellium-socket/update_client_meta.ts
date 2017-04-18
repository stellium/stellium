import * as redis from 'redis'
import {ENV, CacheKeys} from '../@stellium-common'
import {GetNumberOfOnlineUsers} from './controllers/online_users'
import {GetOnlineAdmins} from './controllers/online_admins'
import {GetPageVisitData} from './controllers/page_visit'


const redisClient = redis.createClient({db: ENV.redis_index})


export const UpdateClientMeta = (socket, meta, sessionId: string): void => {

    const clientCacheId = CacheKeys.ClientIDPrefix + sessionId

    redisClient.get(clientCacheId, (err, clientMeta) => {

        const clientAsObject = JSON.parse(clientMeta)

        clientAsObject.current_page = meta.current_page

        clientAsObject.device_type = meta.device_type

        redisClient.set(clientCacheId, JSON.stringify(clientAsObject), err => {

            GetNumberOfOnlineUsers(socket)

            GetOnlineAdmins(socket)

            GetPageVisitData(socket)
        })
    })
}