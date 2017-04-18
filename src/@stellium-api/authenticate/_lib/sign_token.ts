import * as redis from 'redis'
import * as jwt from 'jsonwebtoken'
import {AuthError} from './error_codes'
import {Monolog, CacheKeys, ENV} from '../../../@stellium-common'
import {MongooseSystemUserDocument} from '../../../@stellium-database'


const redisClient = redis.createClient({db: ENV.redis_index})


export const SignJwtToken = (user: MongooseSystemUserDocument, cb: (err: any, token?: string) => void): void => {

    const signedToken = jwt.sign(user, ENV.secret, {
        expiresIn: '2d'
    })

    redisClient.set(CacheKeys.AdminTokenPrefix + user._id, signedToken, (err) => {

        if (err) {
            cb(AuthError.RedisFailure)
            Monolog({
                message: 'Unable to store JWT signed token to redis',
                error: err
            })
            return
        }

        cb(null, signedToken)
    })
}
