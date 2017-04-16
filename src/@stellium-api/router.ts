import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as passport from 'passport'
import {Application, Router} from 'express'
import {V1Router} from './v1/router'
import {AuthenticationRouter} from './authenticate'
import {SystemUserModel} from '../@stellium-database'
import {addStelliumHeaders} from './_lib/cors_middleware'
import {SystemSettingsMiddleware} from '../@stellium-router'
const LocalStrategy = require('passport-local').Strategy


export class ApiRouter {


    router: Router = express.Router();


    constructor(_app: Application) {

        this._configure()

        _app.use('/api', this.router)
    }


    private _configure(): void {


        /**
         * Sets up authentication system with Passport Local
         */
        passport.use(new LocalStrategy(SystemUserModel.authenticate()))
        passport.serializeUser(SystemUserModel.serializeUser())
        passport.deserializeUser(SystemUserModel.deserializeUser())
        this.router.use(passport.initialize())

        this.router.use(bodyParser.json())

        this.router.use(addStelliumHeaders)

        this.router.use(SystemSettingsMiddleware)

        this.router.use('/authenticate', AuthenticationRouter)

        this.router.use('/v1', V1Router)

        this._errorHandler()
    }


    private _errorHandler(): void {

        // Catch 404 if none of the above routes are hooked
        this.router.use((req, res, next) => {
            let err = new Error('Not Found')
            err['status'] = 404
            next(err)
        })

        /*
        this.router.use((err, req, res, next) => {
            if (err.name === 'UnauthorizedError') {
                res.status(401).send('invalid token...')
            }
        })
        */
    }
}
