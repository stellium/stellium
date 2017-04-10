import * as redis from 'redis'
import * as colors from 'colors'
import * as rimraf from 'rimraf'
import * as logger from 'morgan'
import * as express from 'express'
import * as mongoose from 'mongoose'
import * as compression from 'compression'
import * as session from 'express-session'
import * as connectRedis from 'connect-redis'

// @stellium
import {ENV, CachePath} from '../@stellium-common'
import {ApplicationRouter} from '../@stellium-router'
import {ApiRouter} from '../@stellium-api'
import {ErrorsHandler} from './errors_handler'
import {compileScripts} from '../@stellium-compiler'
import {CacheKeys} from '../@stellium-common'
import {ScriptCompilerBluePrint} from '../@stellium-compiler/scripts_compiler'


const RedisStore = connectRedis(session)


const redisClient = redis.createClient({db: '' + ENV.redis_index})

export class ApplicationServer {


    app: express.Application = express()

    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     */
    public static bootstrap(scriptBluePrint: ScriptCompilerBluePrint[] = []): Promise<ApplicationServer> {

        return new Promise((resolve, reject) => {

            rimraf(CachePath, () => {

                compileScripts(scriptBluePrint, err => {

                    if (err) {
                        reject(err)
                        return
                    }

                    console.log(colors.yellow('Flushing redis db for ' + ENV.redis_index))

                    redisClient.flushdb()

                    resolve(new ApplicationServer())
                })
            })
        })
    }


    constructor() {

        (<any>mongoose).Promise = global.Promise
        mongoose.connect('mongodb://localhost/' + ENV.database_name)

        this.configure()

        this._attachRoutes()
    }

    configure() {

        // enable gzip compression
        this.app.use(compression())
    }


    private _attachRoutes() {

        // Use logger in development mode
        if (DEVELOPMENT) this.app.use(logger('dev'))

        new ApiRouter(this.app)

        // Disable iFrame mode outside of the API router
        this.app.use((req, res, next) => {
            req.app.set(CacheKeys.IFrameMode, false)
            next()
        })

        let _session = {
            secret: ENV.secret,
            resave: false,
            saveUninitialized: true,
            cookie: {},
            store: new RedisStore({}),
        }

        if (!DEVELOPMENT) {
            // required by node session
            this.app.set('trust proxy', 1) // trust first proxy
            _session.cookie['secure'] = true // serve secure cookies
        }

        this.app.use(session(_session))

        // Template resource routes for dynamic pages
        new ApplicationRouter(this.app)

        // Error handler for 404 and 500
        new ErrorsHandler(this.app)
    }
}
