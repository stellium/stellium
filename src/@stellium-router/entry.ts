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


const ignoreMiddleware = (req, res, next) => {
    next()
    return
}


export const ApplicationRouter: Router = express.Router()


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
