import * as async from 'async'
import {AuthError} from '../_lib/error_codes'
import {CleanUser} from '../_lib/clean_user'
import {SignJwtToken} from '../_lib/sign_token'
import {CommonErrors, Monolog} from '../../../@stellium-common'
import {MongooseSystemUserDocument, SystemUserModel} from '../../../@stellium-database'


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

        SignJwtToken(pristineUser, (err, token) => {

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