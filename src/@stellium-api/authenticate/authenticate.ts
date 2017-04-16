import * as redis from 'redis'
import * as async from 'async'
import * as jwt from 'jsonwebtoken'
import {SystemUserModel, MongooseSystemUserDocument} from '../../@stellium-database'
import {CleanUser} from './_lib/clean_user'
import {ENV, Monolog, CacheKeys} from '../../@stellium-common'
import {CommonErrors} from '../../@stellium-common'
import {AuthError} from './_lib'


const redisClient = redis.createClient({db: ''+ENV.redis_index})


interface CredentialsData {
    password: string;
    user: MongooseSystemUserDocument;
}


const findUserByEmail = (password: string,
                         email: string,
                         cb: (err: any, credentials?: CredentialsData) => void): void => {

    email = email.toLowerCase()

    SystemUserModel
        .findOne({email, deleted_at: null})
        .exec((err, user) => {
            if (!user) {
                cb(AuthError.NotFound)
                return
            }
            cb(err, {password, user})
        })
}


const authenticateUserDocument = (credentials: CredentialsData,
                                  cb: (err: any, user?: MongooseSystemUserDocument) => void): void => {

    credentials.user.authenticate(credentials.password, (err, user) => {
        if (!user) {
            cb(AuthError.Mismatch)
            return
        }
        cb(err, user)
    })
}


const signJwtToken = (user: MongooseSystemUserDocument, cb: (err: any, token?: string) => void): void => {

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


export const LoginController = (req, res) => {

    async.waterfall([
        async.apply(findUserByEmail, req.body.password, req.body.email.toLowerCase()),
        authenticateUserDocument
    ], (err, user: MongooseSystemUserDocument) => {

        if (err || !user) {

            if (err === AuthError.Mismatch || err === AuthError.NotFound || !user) {
                res.status(401).send('No username with that email and password found')
                return
            }

            res.status(500).send()
            return
        }

        // If the user's status is false, it has been disabled by a super admin
        // disallow login for that account
        if (!user.status) {
            res.status(401).send('Your account has been disabled by your administrator.')
            return
        }

        // Removes hidden or unnecessary fields from the user object
        const pristineUser = CleanUser(user._doc)

        signJwtToken(pristineUser, (err, token) => {

            if (err) {
                res.status(500).send(CommonErrors.InternalServerError + '. Please contact your developer for assistance')
                return
            }

            // Send the response before updating the last_login date
            res.send({
                token,
                user: pristineUser
            })
        })

        // async
        user.last_login = new Date

        user.save(err => {
            if (err) {
                Monolog({
                    message: 'Error while attempting to tag user\'s last login date',
                    error: err,
                })
            }
        })
    })
}


export const LogoutController = (req, res) => {

    // Early respond as the rest of this call should be asynchronous
    res.send({
        message: 'Logged out'
    })

    const email = req.query._e.toLowerCase()

    if (!email || email === 'lost') {
        Monolog({
            message: 'User attempting to log out lost credentials',
            severity: 'moderate'
        })
        return
    }

    SystemUserModel.findOne({email: email}, (err, user) => {

        if (err) {
            Monolog({
                message: 'Error finding user while trying to log out. User: ' + email,
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


export const GetSelfController = (req, res) => {

    SystemUserModel.findById(req.user._id, (err, user) => {

        if (err) {
            res.status(500).send(CommonErrors.InternalServerError)
            Monolog({
                message: 'Error while attempting to retrieve user from database by JWT Token payload',
                error: err
            })
            return
        }

        if (!user) {
            res.status(401).send('Expired or need refresh')
            return
        }

        res.send(user)
    })
}


export const RefreshTokenController = (req, res) => {

    const pristineUser = {...req.user, iat: undefined, exp: undefined}

    signJwtToken(pristineUser, (err, token) => {

        if (err) {
            res.status(500).send(CommonErrors.InternalServerError)
            return
        }

        res.send({token})
    })
}
