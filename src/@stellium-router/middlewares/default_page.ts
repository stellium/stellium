import * as redis from 'redis'
import {LanguageKeys, PageKeys, translateCacheUrl, Monolog, ENV} from '../../@stellium-common'
import {WebsitePageModel} from "../../@stellium-database"


const redisClient = redis.createClient()

/**
 * Determine what is the default page to be showed when the user visits /
 * The default page's URL in the currently active language has to be assigned to the current request's instance
 * @param req - express.Request
 * @param res - express.Response
 * @param next - express.NextFunction
 * @constructor
 */
export const DefaultPageMiddleware = (req, res, next) => {

    // Get currently active language from the current app instance
    let currentLanguage = req.app.get(LanguageKeys.CurrentLanguage)

    redisClient.select(ENV.redis_index, err => {

        if (err) {
            Monolog({
                message: 'Unable to select redis database at index ' + ENV.redis_index,
                error: err,
                severity: 'severe'
            })
            req.status(500).send('Internal Server Error')
            return
        }

        redisClient.get(translateCacheUrl(currentLanguage, PageKeys.DefaultPage), (err, defaultUrl) => {

            // If the default URL has been set before, it was probably saved to memory, retrieve and re-assign to the
            // current request
            if (defaultUrl) {

                if (DEVELOPMENT) console.log('defaultUrl', defaultUrl)

                // current request instance
                req.url = '/' + defaultUrl

                // Forward request
                next()

            } else {

                WebsitePageModel
                    .findOne({'default': true})
                    .select('url')
                    .exec((err, page) => {

                        if (DEVELOPMENT) console.log('page.url', page.url)
                        if (DEVELOPMENT) console.log('currentLanguage', currentLanguage)

                        if (err) {
                            res.sendStatus(500)
                            Monolog({
                                message: 'Error querying default page in router',
                                error: err
                            })
                            return
                        }

                        // Default Page has not been set. Throw fatal.
                        if (!page) {
                            res.sendStatus(500)
                            Monolog({
                                message: 'No default page set. FATAL',
                            })
                            return
                        }

                        // Get the URL of the default page in the currently active language
                        let urlFromLang = page.url[currentLanguage]

                        // If the url of the currently active language is undefined, the page probably exists, but has not been
                        // translated by the admin. Return 404
                        if (typeof urlFromLang === 'undefined') {
                            next()
                            return
                        }

                        // Save default URL for the currently active language for quick retrieval
                        redisClient.set(translateCacheUrl(currentLanguage, PageKeys.DefaultPage), urlFromLang)

                        // Assign default URL to current request
                        req.url = '/' + urlFromLang

                        if (DEVELOPMENT) console.log('req.url', req.url)

                        // Forward request with the overridden URL
                        next()
                    })
            }
        })
    })
}
