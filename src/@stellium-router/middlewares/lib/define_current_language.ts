import * as redis from 'redis'
import * as express from 'express';
import {LanguageKeys} from '../../../@stellium-common';
import {Monolog} from '../../../@stellium-common/monolog/monolog'
import {ENV} from '../../../@stellium-common/development/environment_variable'

const redisClient = redis.createClient()


export const DefineCurrentLanguage = (req: express.Request, callback: (err: any, language?: string) => void): void => {

    // Remove leading and trailing slashes
    // /some/url => `some/url`
    let trimUrl = req.originalUrl.replace(/^\/+|\/+$/g, '')

    // The first URL should be the language key if set
    // en/some/url => `en`
    let [lang] = trimUrl.split('/')


    let languageToSet

    redisClient.select(ENV.redis_index, err => {

        if (err) {
            Monolog({
                message: 'Unable to select redis database at index ' + ENV.redis_index,
                error: err,
                severity: 'severe'
            })

            callback(err)

            return
        }

        redisClient.get(LanguageKeys.DefaultLanguage, (err, defaultLanguage) => {

            redisClient.get(LanguageKeys.AvailableLanguages, (err, availLanguagesString) => {

                let availableLanguages: string[] = JSON.parse(availLanguagesString)

                // Check if the language code really is a language
                // en/some/url => OK, english
                // xx/some/url => NO, maybe it's just a regular URL
                if (availableLanguages && availableLanguages.includes(lang)) {

                    // Language selector in URL matches one of the available languages
                    // in the db, so it must be a language code
                    // e.g en/some/url => `en`
                    languageToSet = lang

                    req.url = (req.url + '/').replace('/' + lang, '')

                } else {

                    // It is not a language, set the current language to the default language
                    // xx/some/url => language is set to default language as `xx` does not match
                    // any languages in the DB
                    languageToSet = defaultLanguage
                }

                /**
                 * TODO(perf): Can we not just store it in the request? Is it faster than using redis?
                 * @date - 26 Mar 2017
                 * @time - 1:31 PM
                 */
                // Store current language in memory
                redisClient.set(LanguageKeys.CurrentLanguage, languageToSet)

                callback(null, languageToSet)
            })
        })
    })
}