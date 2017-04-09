import * as redis from 'redis'
import * as express from 'express'
import {LanguageKeys, ENV, Monolog} from '../../../@stellium-common'

const redisClient = redis.createClient();


export const AssignBaseUrl = (websiteRouter: express.Application) => (current_language: string): void => {

    redisClient.select(ENV.redis_index, err => {

        if (err) {
            Monolog({
                message: 'Unable to select redis database at index ' + ENV.redis_index,
                error: err,
                severity: 'severe'
            })

            websiteRouter.locals.base_url = ''

            return
        }

        redisClient.get(LanguageKeys.AvailableLanguages, (err, availableLanguagesString) => {

            let availableLanguages: string[] = JSON.parse(availableLanguagesString)

            redisClient.get(LanguageKeys.DefaultLanguage, (err, defaultLanguage) => {

                if (availableLanguages.includes(current_language)) {

                    // Prefix base path with language for navigation consistency
                    websiteRouter.locals.base_url = current_language === defaultLanguage ? '' : current_language + '/'

                } else {

                    websiteRouter.locals.base_url = ''
                }
            })
        })
    })
};