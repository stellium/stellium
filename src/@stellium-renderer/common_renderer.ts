import * as ejs from 'ejs'
import * as async from 'async'
import * as cheerio from 'cheerio'
import {
    Request,
    Response
} from 'express'
import * as redis from 'redis'
import {
    LanguageKeys,
    minifyTemplate,
    Monolog,
    translateCacheUrl,
    ViewsPath,
    CacheKeys,
} from '../@stellium-common'
import {getShoppingCartContent} from './globals/shopping_cart'
import {CommonPageData} from './common_interface'
import {TemplateFunctions} from './template_functions'
import {toJSON} from './lib/to_json'
import {SettingsKeys} from '../@stellium-common/keys/settings'
import {ENV} from '../@stellium-common/development/environment_variable'
const universalAnalytics = require('universal-analytics')



const redisClient = redis.createClient()


const cachePageData = (req: Request, html) => {

    // Cache key of where to store the compiled HTML in redis for later retrieval
    let cacheKey = translateCacheUrl(req.app.get(LanguageKeys.CurrentLanguage), req.url)

    if (req.query.hot) cacheKey = cacheKey + '_hot'

    redisClient.select(ENV.redis_index, err => {

        if (err) {
            Monolog({
                message: 'Unable to select redis database at index ' + ENV.redis_index,
                error: err,
                severity: 'severe'
            })
            return
        }

        // Save compiled HTML to memory
        redisClient.set(
            cacheKey,
            minifyTemplate(html)
        )
    })
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


    const systemSettings = req.app.get(CacheKeys.SettingsKey)


    const iFrameMode = req.app.get(CacheKeys.IFrameMode)


    pageData['iFrameMode'] = iFrameMode


    // Data to be resolved for all pages
    // we only resolve globally available data such as shopping cart content, navigation tree
    let asyncOp = {}


    // Get shopping cart content if not for iFrame
    if (!iFrameMode) {
        asyncOp['shoppingCart'] = async.apply(getShoppingCartContent, req.session.id)
    }

    // Apply globally available variables such as shopping cart
    async.parallel(asyncOp, <AsyncResultObjectCallback>(err, results) => {

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
        cartTotal = results.shoppingCart && results.shoppingCart.reduce((_sum, _current) => _sum + (_current['variant'].pricing.price * _current['quantity']), cartTotal)

        // Assign navigation tree if not previously resolved
        // if (!pageData.page.navigation && results[1]) pageData.navigation = results[1].children;

        // Push cart items and cart total value to the page data to be rendered
        pageData.shoppingCartItem = results.shoppingCart
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


        // Whether Hot Reload is enabled
        req.app.set(CacheKeys.HotReload, req.query.hot && req.query.hot === 'true')


        // Convert TemplateFunctions' class instance to plain Object
        const templateFunctions = toJSON(new TemplateFunctions(req))


        // Object accessible from within the ejs template
        pageData = {...pageData, ...templateFunctions}


        res.render(<string>template, pageData, (err, html) => {

            if (err) {
                if (callback) callback(err)
                else res.status(500).send()
                Monolog({
                    message: 'Failed to render ' + req.url,
                    error: err
                })
                return
            }

            if (!iFrameMode && !DEVELOPMENT) {

                const GATrackingIdSettings = systemSettings.find(_setting => _setting.key === SettingsKeys.AnalyticsTrackingID)

                if (GATrackingIdSettings) {

                    universalAnalytics(GATrackingIdSettings.value, req.session.id).pageview(req.originalUrl, err => {

                        console.log('analytics send for', GATrackingIdSettings.value, req.session.session_id)

                        if (err) {
                            Monolog({
                                message: 'Registering visitor for analytics tracking failed',
                                error: err
                            })
                        }
                    })

                } else {

                    Monolog({
                        message: 'Analytics Tracking ID was not found while attempting to track analytics data',
                        error: new Error('Analytics Tracking ID Missing')
                    })
                }
            }

            // Retrieve hot reload configuration
            const hotReloadConfig = systemSettings.find(_setting => _setting.key === SettingsKeys.HotPageReload)

            // Whether hot reload is enable
            const useHotReload = hotReloadConfig && hotReloadConfig.value

            const $ = cheerio.load(html)

            // If hot reload is enabled we want to process the html template before sending it back to the user
            if (useHotReload) {

                /**
                 * TODO(opt): Get modular script and stylesheet files for the page to be reloaded
                 * @date - 07 Apr 2017
                 * @time - 7:16 PM
                 */
                // Detects whether the request was made by Stellium's hot reload engine
                // if it was, we need to extract the hot element from the page, leaving
                // only the hot reloaded content to be sent to the browser
                if (req.query.hot) {

                    // Extracts the html inside the hot container only, stripping anything else in the page
                    const body = $('[mt-hot-container]')

                    // Get the string value of the hot container DOM
                    const hotContent = body.html()

                    /**
                     * TODO(opt): Make content length work for real progress loading
                     * @date - 07 Apr 2017
                     * @time - 7:16 PM
                     */
                    res.set({
                        'content-type': 'text/html;charset=utf-8',
                        'content-length': Buffer.byteLength(hotContent, 'utf-8'),
                        // 'transfer-encoding': ''
                    })

                    const pageTitle = pageData.page.title[req.app.get(LanguageKeys.CurrentLanguage)]

                    const hotContentMeta = {
                        content: hotContent,
                        title: pageTitle,
                        scripts: [],
                        styles: []
                    }

                    res.send(hotContentMeta)

                    if (!iFrameMode) cachePageData(req, JSON.stringify(hotContentMeta))

                    return
                }

                // Add loading bar for hot update progress and event listeners
                $('body').prepend('<div id="mt-hot-progress-bar"></div>')

                //noinspection ES6ConvertVarToLetConst,JSUnusedLocalSymbols
                $('head').append(`<script>var HotReloadQueue = 0; var __DEV = ${DEVELOPMENT};</script>`)
            }

            // Set development environment if enabled
            if (DEVELOPMENT) {
                //noinspection ES6ConvertVarToLetConst,JSUnusedLocalSymbols
                $('body').prepend(`<span mt-variable-value="__DEV"></span>`)
            }

            // Extract the rendered and mutated page object as string
            html = $.html()


            // If the page editor inside stellium is requesting the page
            // we must return it in the callback as it will be handle by the Stellium
            // page previewer
            if (callback) {

                callback(null, html)
                return
            }


            // Send rendered HTML before caching for speedier first time serves
            // This only applies for requests made by the browser and not Stellium's
            // page editor engine
            res.send(html)


            // Save the minified HTML string of the rendered template into memory by using the language and url key
            // as the memory key address, in DEVELOPMENT, we bypass this step
            if (pageData.page.cache && !DEVELOPMENT && !iFrameMode) cachePageData(req, html)
        })
    })
}
