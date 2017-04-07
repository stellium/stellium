import {PageCacheMiddleware} from './middlewares/page_cache'
import {MultiLanguageMiddleware} from './middlewares/multi_language'
import {DefaultPageMiddleware} from './middlewares/default_page'
import {Application} from 'express'
import {DynamicRenderer} from "../@stellium-renderer";
import {AjaxController} from "./controllers/ajax/ajax_controller";
import {SystemSettingsMiddleware} from "./middlewares/system_settings";


const ignoreMiddleware = (req, res, next) => {
    next()
    return
}


export class ApplicationRouter {


    app: Application;


    constructor(_app: Application) {

        this.app = _app

        this._configure()
    }


    private _configure(): void {

        const disallowedUrls = ['media', 'cache', 'mt-users']

        disallowedUrls.forEach(_url => this.app.use('/' + _url, ignoreMiddleware))

        // Assign system languages to the current req.app instance
        this.app.use(SystemSettingsMiddleware)

        this.app.use('/ajax', AjaxController)

        // Assign system languages to the current req.app instance
        this.app.use(MultiLanguageMiddleware)


        // this.app.use((req, res, next) => {
        //     // let currentLanguage = req.app.get(LanguageKeys.CurrentLanguage)
        //     next()
        // })

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
