export * from './authenticate'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as passport from 'passport'
import {V1Router} from './v1'
import {SystemUserModel} from '../@stellium-database'
import {addStelliumHeaders} from './_lib/cors_middleware'
import {SystemSettingsMiddleware} from '../@stellium-router'
import {Router} from 'express'
import {AuthenticationRouter} from './authenticate/index'
const LocalStrategy = require('passport-local').Strategy


export const ApiRouter: Router = express.Router()


// Sets up authentication system with Passport Local
passport.use(new LocalStrategy(SystemUserModel.authenticate()))

passport.serializeUser(SystemUserModel.serializeUser())

passport.deserializeUser(SystemUserModel.deserializeUser())

ApiRouter.use(passport.initialize())


ApiRouter.use(bodyParser.json())

ApiRouter.use(addStelliumHeaders)

ApiRouter.use(SystemSettingsMiddleware)


ApiRouter.use('/authenticate', AuthenticationRouter)

ApiRouter.use('/v1', V1Router)

// Catch 404 if none of the above routes are hooked
ApiRouter.use((req, res, next) => {
    let err = new Error('Not Found')
    err['status'] = 404
    next(err)
})

