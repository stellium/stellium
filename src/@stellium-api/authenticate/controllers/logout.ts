import * as redis from 'redis'
import {Monolog, CacheKeys, ENV} from '../../../@stellium-common'
import {SystemUserModel} from '../../../@stellium-database'


const redisClient = redis.createClient({db: ENV.redis_index})

export const LogoutController = (req, res) => {

    // Early respond as the rest of this call should be asynchronous
    res.send({
        message: 'Logged out'
    })

    const userId = req.query._e.toLowerCase()

    if (!userId || userId === 'lost') {
        Monolog({
            message: 'User attempting to log out lost credentials',
            severity: 'moderate'
        })
        return
    }

    SystemUserModel.findById(userId, (err, user) => {

        if (err) {
            Monolog({
                message: 'Error finding user while trying to log out. User: ' + userId,
                severity: 'moderate'
            })
            return
        }

        if (!user) {
            Monolog({
                message: 'User not found while attempting to update their last login date',
                severity: 'moderate'
            })
            return
        }

        // Deletes and invalidates token from cache db
        redisClient.del(CacheKeys.AdminTokenPrefix + user._id)
    })
}