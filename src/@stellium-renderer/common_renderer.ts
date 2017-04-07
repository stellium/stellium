import * as cheerio from 'cheerio'
import * as async from 'async'
import {
    Request,
    Response
} from 'express'
import * as redis from 'redis'
import {
    ENV,
    LanguageKeys,
    minifyTemplate,
    Monolog,
    translateCacheUrl,
    ViewsPath,
    SystemSettingsSchema,
} from "../@stellium-common";
import {getShoppingCartContent} from './globals/shopping_cart'
import {CommonPageData} from './common_interface'
import {TemplateFunctions} from './template_functions'
import {SystemSettingsModel} from "../@stellium-database";
import {readSeederFile} from "../@stellium-database";
import {toJSON} from "./lib/to_json";
import {CacheKeys} from "../@stellium-common/keys/cache_keys";
import {SettingsKeys} from "../@stellium-common/keys/settings";

const redisClient = redis.createClient()


const populateProjectSettings = (cb: (err: any, settings?: SystemSettingsSchema[]) => void): void => {

    // In development mode, fetch settings directly from the json seeder file
    if (ENV.render_from_json) readSeederFile('settings', (err, settings) => cb(err, settings))

    // In production query database for the settings
    else SystemSettingsModel.find({}, (err, settings) => cb(err, settings))
}


export const CommonRenderer = (req: Request,
                               res: Response,
                               pageData?: CommonPageData,
                               template: string | ((err: any, page?: string) => void) = 'index',
                               callback?: (err: any, page?: string) => void): void => {

    if (typeof template === 'function') {
        callback = template
        template = 'index'
    }


    const iFrameMode = req.app.get('iframe')


    // Data to be resolved for all pages
    // we only resolve globally available data such as shopping cart content, navigation tree
    let asyncOp = [
        populateProjectSettings
    ]


    // Get shopping cart content if not for iFrame
    if (!iFrameMode) asyncOp.push(async.apply(getShoppingCartContent, req['session'].id))

    // Apply globally available variables such as shopping cart
    async.parallel(asyncOp, (err, results) => {

        if (err) {
            if (callback) callback(err)
            else res.sendStatus(500)
            Monolog({
                message: 'Error resolving global page dependencies',
                error: err
            })
            return
        }

        let cartTotal = 0

        // Count total cart value
        cartTotal = results[1] && results[1].reduce((_sum, _current) => _sum + (_current['variant'].pricing.price * _current['quantity']), cartTotal)

        // Assign navigation tree if not previously resolved
        // if (!pageData.page.navigation && results[1]) pageData.navigation = results[1].children;

        // Push cart items and cart total value to the page data to be rendered
        pageData.shoppingCartItem = results[1]
        pageData.cartTotal = cartTotal

        // Theme Variables for page specific settings
        // e.g. Navigation bar color, secondary highlight colors etc.
        pageData.theme_variables = pageData.page.theme_variables

        // Disable view cache in production
        req.app.disable('view cache')

        req.app.set('view cache', !DEVELOPMENT)

        req.app.set('views', ViewsPath)

        // Use ejs as the template rendering engine
        req.app.set('view engine', 'ejs')

        req.app.set('project_settings', results[0])

        // Convert TemplateFunctions' class instace to plain Object
        const templateFunctions = toJSON(new TemplateFunctions(req))

        pageData = {...pageData, ...templateFunctions}

        res.render(<string>template, pageData, (err, html) => {

            // const settings: SystemSettingsSchema[] = req.app.get(CacheKeys.SettingsKey)

            // const useHotReload = settings.find(_settings => _settings.key === SettingsKeys.HotPageReload).value

            const $ = cheerio.load(html)

            // Add loading bar for hot update progress and event listeners
            $('body').prepend('<div id="mt-hot-progress-bar"></div>')

            //noinspection ES6ConvertVarToLetConst,JSUnusedLocalSymbols
            $('head').append(`<script>var HotReloadQueue = 0; var __DEV = true;</script>`)

            if (req.query.hot) {

                const body = $('[mt-hot-container]')

                const hotContent = body.html()

                res.set({
                    'content-type': 'text/html;charset=utf-8',
                    'content-length': Buffer.byteLength(hotContent, 'utf-8'),
                    // 'transfer-encoding': ''
                })

                res.send({
                    title: pageData.page.title[req.app.get(LanguageKeys.CurrentLanguage)],
                    content: hotContent,
                })
            }

            html = $.html()

            if (err) {
                if (callback) callback(err)
                else res.sendStatus(500)
                Monolog({
                    message: 'Failed to render ' + req.url,
                    error: err
                })
                return
            }

            if (callback) {
                callback(null, html)
                return
            }

            // Send rendered HTML before caching for speedier first time serves
            if (!req.query.hot) res.send(html)

            // Save the minified HTML string of the rendered template into memory by using the language and url key
            // as the memory key address, in DEVELOPMENT, we bypass this step
            if (pageData.page.cache && !DEVELOPMENT) {

                // Cache key of where to store the compiled HTML in redis for later retrieval
                let cacheKey = translateCacheUrl(req.app.get(LanguageKeys.CurrentLanguage), req.url)

                if (req.query.hot) cacheKey = cacheKey + '_hot'

                // Save compiled HTML to memory
                redisClient.set(
                    cacheKey,
                    minifyTemplate(html)
                )
            }
        })
    })
}
