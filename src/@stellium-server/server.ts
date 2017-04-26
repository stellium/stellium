import * as redis from 'redis'
import * as colors from 'colors'
import * as logger from 'morgan'
import * as express from 'express'
import * as mongoose from 'mongoose'
import * as compression from 'compression'
import * as session from 'express-session'
import * as connectRedis from 'connect-redis'
import * as cookieParser from 'cookie-parser'
import {Application} from 'express'
// @stellium
import {ENV, CacheKeys} from '../@stellium-common'
import {ApplicationRouter} from '../@stellium-router'
import {ApiRouter} from '../@stellium-api'
import {ErrorHandler} from './errors_handler'
import {CompileScripts} from '../@stellium-compiler'
import {ScriptCompilerBluePrint} from '../@stellium-compiler'


const RedisConnectStore = connectRedis(session)

const redisClient = redis.createClient({db: ENV.redis_index})

const ApplicationServer: Application = express()


;(<any>mongoose).Promise = global.Promise
mongoose.connect('mongodb://localhost/' + ENV.database_name)

// enable gzip compression
ApplicationServer.use(compression())

ApplicationServer.disable('x-powered-by')
ApplicationServer.disable('server')

// Use logger in development mode
if (LOG_ERRORS) ApplicationServer.use(logger('dev'))

// Initialise API Routes
ApplicationServer.use('/api', ApiRouter)

// Disable iFrame mode outside of the API router
ApplicationServer.use((req, res, next) => {
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
    ApplicationServer.set('trust proxy', 1) // trust first proxy
    _session.cookie['secure'] = true // serve secure cookies
}

ApplicationServer.use(cookieParser())

ApplicationServer.use(session(_session))

// Template resource routes for dynamic pages rendering
ApplicationServer.use(ApplicationRouter)

// HTTP Error handler
ErrorHandler(ApplicationServer)


export const ApplicationBootstrap = (scriptBluePrint: ScriptCompilerBluePrint[] = []): Promise<any> => {

    return new Promise((resolve, reject) => {

        console.log(colors.yellow('Flushing redis db. Index: ' + ENV.redis_index))

        redisClient.flushdb(() => {

            if (!process.argv.includes('--compileScripts')) {

                resolve(ApplicationServer)

                return
            }

            CompileScripts(scriptBluePrint, err => {

                if (err) {

                    reject(err)

                    return
                }

                resolve(ApplicationServer)
            })
        })
    })
}
