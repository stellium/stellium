import * as redis from 'redis'
import * as async from 'async'
import {CacheKeys, ENV} from '../../@stellium-common'
import {Monolog} from '../../@stellium-common/monolog/monolog'
import {CommonErrors} from '../../@stellium-common/keys/errors'
import {SocketEventKeys} from '../../@stellium-common/keys/socket_events'


const redisClient = redis.createClient({db: ENV.redis_index})


const redisVisitQuery = (key, cb: (err: any, data?: any) => void): void => {

    redisClient.get(key, (err, data) => {

        const parsedData = data && JSON.parse(data)

        cb(err, parsedData)
    })
}


export const GetPageVisitData = (socket): void => {

    redisClient.keys(CacheKeys.ClientIDPrefix + '*', (err, keys) => {

        if (err) {
            socket.emit('exception', {
                errorMessage: CommonErrors.InternalServerError
            })
            Monolog({
                message: 'Error retrieving client keys for socket users',
                error: err
            })
            return
        }

        async.map(keys, redisVisitQuery, (err, data) => {

            if (err) {
                socket.emit('exception', {
                    errorMessage: CommonErrors.InternalServerError
                })
                Monolog({
                    message: 'Failed to asynchronously map user visits for Socket poll',
                    error: err
                })
                return
            }

            socket.emit(SocketEventKeys.RequestUserVisits, data)
        })
    })
}