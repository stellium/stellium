import {Router} from 'express'
import * as express from 'express'
import * as ejwt from 'express-jwt'
import {ENV} from '../../@stellium-common'
import {
    RefreshTokenController,
    LoginController,
    LogoutController,
    GetSelfController
} from './controllers'
export * from './_lib'


export const AuthenticationRouter: Router = express.Router()

AuthenticationRouter.post('/', LoginController)

AuthenticationRouter.delete('/', LogoutController)

AuthenticationRouter.get(
    '/self',
    // Attach JWT middleware for this route to correctly
    // retrieve the user object from the request
    ejwt({secret: ENV.secret}),
    GetSelfController
)

AuthenticationRouter.get(
    '/refresh',
    // Attach JWT middleware for this route to correctly
    // retrieve the user object from the request
    ejwt({secret: ENV.secret}),
    RefreshTokenController
)
