import * as redis from 'redis'
import * as colors from 'colors'
import * as logger from 'morgan'
import * as express from 'express'
import * as mongoose from 'mongoose'
import * as compression from 'compression'
import * as session from 'express-session'
import * as connectRedis from 'connect-redis'
import * as cookieParser from 'cookie-parser'
// @stellium
import {ENV, CacheKeys} from '../@stellium-common'
import {ApplicationRouter} from '../@stellium-router'
import {ApiRouter} from '../@stellium-api'
import {ErrorsHandler} from './errors_handler'
import {CompileScripts} from '../@stellium-compiler'
import {ScriptCompilerBluePrint} from '../@stellium-compiler'
import {StoreService, StoreKeys} from '../@stellium-store'


const RedisConnectStore = connectRedis(session)


const redisClient = redis.createClient({db: ENV.redis_index})


export class ApplicationServer {


    app: express.Application = express()


    //noinspection JSUnusedGlobalSymbols
    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     */
    public static bootstrap(scriptBluePrint: ScriptCompilerBluePrint[] = []): Promise<ApplicationServer> {

        return new Promise((resolve, reject) => {

            console.log(colors.yellow('Flushing redis db. Index: ' + ENV.redis_index))

            redisClient.flushdb(() => {

                const appServer = new ApplicationServer()

                if (!process.argv.includes('--compileScripts')) {

                    resolve(appServer)

                    return
                }

                CompileScripts(scriptBluePrint, err => {

                    if (err) {

                        reject(err)

                        return
                    }

                    resolve(appServer)
                })
            })
        })
    }


    constructor() {

        StoreService.update(StoreKeys.Whatever, 'hello')

        this.configure()
    }


    configure() {

        (<any>mongoose).Promise = global.Promise
        mongoose.connect('mongodb://localhost/' + ENV.database_name)

        // enable gzip compression
        this.app.use(compression())

        // Use logger in development mode
        if (LOG_ERRORS) this.app.use(logger('dev'))

        // Initialise API Routes
        this.app.use('/api', ApiRouter)

        // Disable iFrame mode outside of the API router
        this.app.use((req, res, next) => {
            req.app.set(CacheKeys.IFrameMode, false)
            next()
        })

        let _session = {
            secret: ENV.secret,
            resave: false,
            saveUninitialized: true,
            cookie: {
                httpOnly: false
            },
            store: new RedisConnectStore({db: ENV.redis_index}),
        }

        if (!DEVELOPMENT && ENV.use_ssl) {
            // required by node session
            this.app.set('trust proxy', 1) // trust first proxy
            _session.cookie['secure'] = true // serve secure cookies
        }

        this.app.use(cookieParser())

        this.app.use(session(_session))

        // Template resource routes for dynamic pages rendering
        this.app.use(ApplicationRouter)

        // HTTP Error handler
        new ErrorsHandler(this.app)
    }
}
