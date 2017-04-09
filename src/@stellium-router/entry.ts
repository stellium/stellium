import {PageCacheMiddleware} from './middlewares/page_cache'
import {MultiLanguageMiddleware} from './middlewares/multi_language'
import {DefaultPageMiddleware} from './middlewares/default_page'
import {Application} from 'express'
import {DynamicRenderer} from '../@stellium-renderer'
import {AjaxController} from './controllers/ajax/ajax_controller'
import {SystemSettingsMiddleware} from './middlewares/system_settings'
import {AnalyticsMiddleware} from './analytics/middleware'
import {OffersDetailController} from './offers/offers_controller'


const ignoreMiddleware = (req, res, next) => {
    next()
    return
}


export class ApplicationRouter {


    app: Application


    constructor(_app: Application) {

        this.app = _app

        this._configure()
    }


    private _configure(): void {


        // Routes that should have been handled by NGINX directly
        const disallowedUrls = ['media', 'mt-users', 'c']

        // Bypass the nginx URLs to relieve express app from stress
        disallowedUrls.forEach(_url => this.app.use('/' + _url, ignoreMiddleware))


        /*
        this.app.use((req, res, next) => {

            // TODO(security): Is this the best way to check whether a request is for a file?
            // Checks if the request is trying to find a file
            const isAssetsRequest = req.url.includes('.')

            // Do not process static assets via express
            // we want them to be handled by NGINX
            if (isAssetsRequest) {
                let err = new Error('Not Found')
                err['status'] = 404
                next(404)
            }

            // Move request forward for non-assets requests
            else next()
        })
    */


        // Assign system settings to the current req.app instance
        this.app.use(SystemSettingsMiddleware)


        // The Google Universal Analytics middleware depends on system settings to correctly retrieve the client's
        // tracking, do not reposition above the SystemSettingsMiddleware
        // We only want to use this feature when we are not in development and HotPageReload is activated
        if (!DEVELOPMENT) this.app.use(AnalyticsMiddleware)


        // Request handler for AJAX request made on the front-end
        this.app.use('/ajax', AjaxController)


        // Assign system languages to the current req.app instance
        this.app.use(MultiLanguageMiddleware)




        this.app.get('/offers/:offerUrl', OffersDetailController)





        // Get default page URL and assign it to the current request.url address
        // e.g `home` for english, `beranda` for indonesian, `start-pagina` for dutch etc.
        this.app.get('/', DefaultPageMiddleware)


        // Pages that are not cached should be handled above this middleware
        if (!DEVELOPMENT) this.app.use(PageCacheMiddleware)


        /**
         * TODO(production): re-introduce ecommerce routes
         * @date - 25 Mar 2017
         * @time - 7:31 PM
         */

        this.app.use(DynamicRenderer)
    }
}
