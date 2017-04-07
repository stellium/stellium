import {
    LanguageKeys,
    Monolog
} from "../../@stellium-common";
import {DefineDefaultLanguage} from "./lib/define_default_language";
import {DefineCurrentLanguage} from "./lib/define_current_language";
import {AssignBaseUrl} from "./lib/assign_base_url";


/**
 * Setup the current, default and available languages and saves them into the memory
 * @constructor
 * @param req
 * @param res
 * @param next
 */
export const MultiLanguageMiddleware = (req, res, next): void => {

    // Redirects any URL with trailing slashes to non-slash-ending URLs
    if (req.url !== '/' && req.url.endsWith('/')) req.url = req.url.replace(/\/$/, '')

    // Define what is the default language in case other languages fails
    DefineDefaultLanguage((err, _defaultLanguage, _availableLanguages) => {

        if (err) {
            res.status(500).send('An error occurred while rendering this page')
            Monolog({
                message: 'Fatal error defining default language.',
                error: err
            })
            return
        }

        // Save default language to current app's global object
        req.app.set(LanguageKeys.DefaultLanguage, _defaultLanguage)

        // Save available languages to current app's global object
        req.app.set(LanguageKeys.AvailableLanguages, _availableLanguages)

        // Define what language is currently being used on the website
        DefineCurrentLanguage(req, (err, _currentLanguage) => {

            if (err) {
                res.sendStatus(500);
                Monolog({
                    message: 'Error defining current language',
                    error: err
                })
                return
            }

            // Save current language to current app's global object
            req.app.set(LanguageKeys.CurrentLanguage, _currentLanguage)

            // Assign current base URL in accordance to which language is currently active
            AssignBaseUrl(req.app)(_currentLanguage)

            // Move on
            next()
        })
    })
}
