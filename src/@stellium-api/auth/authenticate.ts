import * as async from 'async'
import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import * as ejwt from 'express-jwt'
import {Router} from 'express'
import {SystemUserModel, MongooseSystemUserDocument} from '../../@stellium-database'
import {CleanUser} from './_lib/clean_user'
import {ENV, Monolog} from '../../@stellium-common'


enum AuthError {
    Mismatch = 0,
    NotFound = 1,
    Disabled = 3,
}


export const AuthenticationRouter: Router = express.Router()


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


const signJwtToken = (user: MongooseSystemUserDocument): string => {

    return jwt.sign(user, ENV.secret, {
        expiresIn: '2d'
    })
}


AuthenticationRouter.post('/', (req, res) => {

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

        // Send the response before updating the last_login date
        res.send({
            user: pristineUser,
            token: signJwtToken(pristineUser)
        })

        // async
        user.last_login = Date.now()

        user.save(err => {
            if (err) {
                Monolog({
                    message: 'Error while attempting to tag user\'s last login date',
                    error: err,
                })
            }
        })
    })
})


AuthenticationRouter.delete('/', (req, res) => {

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

        if (user) {
            Monolog({
                message: 'User not found while attempting to update their last login date',
                severity: 'moderate'
            })
            return
        }

        user.last_login = Date.now()

        user.save(err => {
            if (err) {
                Monolog({
                    message: 'Error while attempting to tag user\'s last login date after logout',
                    error: err
                })
            }
        })
    })
})

AuthenticationRouter.get(
    '/self',
    // Attach JWT middleware for this route to correctly
    // retrieve the user object from the request
    ejwt({secret: ENV.secret}),
    (req, res) => {

        SystemUserModel.findById(req.user._id, (err, user) => {

            if (err) {
                res.status(500).send('Internal Server Error')
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
)
