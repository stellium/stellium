import * as colors from 'colors'
import * as redis from 'redis'
import {
    ENV,
    Monolog,
    CacheKeys,
    CommonErrors
} from '../@stellium-common'
import {GetPageVisitData} from './controllers/page_visit'
import {GetNumberOfOnlineUsers} from './controllers/online_users'
import {GetOnlineAdmins} from './controllers/online_admins'


const redisClient = redis.createClient({db: ENV.redis_index})


export const AdminConnectionHandler = (client): void => {

    // user id must be provided when establishing a connection from client to server
    const userId = client.handshake.query['user_id']

    const requestToken = client.handshake.query['token']

    if (!requestToken) {
        client.emit('exception', {
            errorMessage: 'No token provided'
        })
        Monolog({
            message: 'Someone attempted to connect to the socket server as admin without providing a token',
            severity: 'moderate'
        })
        return
    }

    redisClient.get(CacheKeys.AdminTokenPrefix + userId, (err, cachedToken) => {

        if (err) {
            client.emit('exception', {
                errorMessage: CommonErrors.InternalServerError
            })
            Monolog({
                message: 'Unable to retrieve user signed token',
                error: err
            })
            return
        }

        if (cachedToken !== requestToken) {
            if (LOG_ERRORS) console.log(colors.red('Token does not match stored token'))
            // Token does not match the token stored in redis
            client.emit('exception', {
                errorMessage: 'Token mismatch'
            })
            return
        }

        redisClient.set(CacheKeys.AdminIDPrefix + userId, client.id, err => {

            if (err) {
                client.emit('exception', {
                    errorMessage: CommonErrors.InternalServerError
                })
                Monolog({
                    message: 'Unable to store Socket.io on user\'s connection',
                    error: err
                })
                return
            }

            GetNumberOfOnlineUsers(client)

            GetOnlineAdmins(client)

            GetPageVisitData(client)
        })
    })
}