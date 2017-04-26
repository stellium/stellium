import * as express from 'express'
import {Router} from 'express'
import {DynamicRenderer} from '../@stellium-renderer'
import {PageCacheMiddleware} from './middlewares/page_cache'
import {MultiLanguageMiddleware} from './middlewares/multi_language'
import {DefaultPageMiddleware} from './middlewares/default_page'
import {AjaxController} from './controllers/ajax/ajax_controller'
import {OffersDetailController} from './offers/offers_controller'
import {CustomRoutesMiddleware} from './custom'
import {SystemSettingsMiddleware} from './middlewares/system_settings'

// TEST
import {MonologModel} from '../@stellium-common/monolog/model'
import {ENV} from '../@stellium-common'


const ignoreMiddleware = (req, res, next) => next()


export const ApplicationRouter: Router = express.Router()


/**
 * TODO(opt): Move to it's own module
 * @date - 4/23/17
 * @time - 2:13 PM
 */
ApplicationRouter.get('/stellium/expecto_patronum/:monologId', (req, res, next) => {

    MonologModel.findById(req.params.monologId, (err, monologEntry) => {

        const formattedError = JSON.stringify(monologEntry.error, null, 4)

        res.send(`
        <html>
        <head>
        <title>Error Logger</title>
        <link href="http://${ENV.stellium_domain}/admin/assets/fonts/fira-code/fira_code.css" rel="stylesheet">
        <style>
            code {
                display: inline-block;
                white-space: pre-wrap;
                font-family: 'Fira Code',monospace;
                font-size: 1rem;
                padding: 1rem;
                background-color: rgba(10, 20, 30, .86);
                color: white;
            }
        </style>
        </head>
        <body style="font-family:'Helvetica Neue','Roboto',sans-serif">
            <p>Timestamp: ${monologEntry.created_at}</p>
            <p>Message:</p>
            <h3>${monologEntry.message}</h3>
            <p>Error Log:</p>
            <code>${formattedError}</code>
        </body>
        </html>
        `)

        monologEntry.update({status: 'read'})
    })
})

// Routes that should have been handled by NGINX directly
const disallowedUrls = ['media', 'mt-users', 'c']


// Bypass the nginx URLs to relieve express app from stress
disallowedUrls.forEach(_url => ApplicationRouter.use('/' + _url, ignoreMiddleware))


// Request handler for AJAX request made on the front-end
ApplicationRouter.use('/ajax', AjaxController)


// Assign system languages to the current req.app instance
ApplicationRouter.use(MultiLanguageMiddleware)


ApplicationRouter.use(SystemSettingsMiddleware)


ApplicationRouter.use(CustomRoutesMiddleware)


ApplicationRouter.get('/offers/:offerUrl', OffersDetailController)


// Get default page URL and assign it to the current request.url address
// e.g `home` for english, `beranda` for indonesian, `start-pagina` for dutch etc.
ApplicationRouter.get('/', DefaultPageMiddleware)


// Pages that are not cached should be handled above this middleware
if (!DEVELOPMENT) ApplicationRouter.use(PageCacheMiddleware)


/**
 * TODO(production): re-introduce ecommerce routes
 * @date - 25 Mar 2017
 * @time - 7:31 PM
 */
ApplicationRouter.use(DynamicRenderer)
