import * as redis from 'redis'
import {SystemLanguageModel} from '../../../@stellium-database'
import {Monolog, LanguageKeys, ENV} from '../../../@stellium-common'

const redisClient = redis.createClient({db: ENV.redis_index})


export const DefineDefaultLanguage = (callback: (error: any, defaultLanguage?: string, availableLanguages?: string[]) => void): void => {

    redisClient.get(LanguageKeys.AvailableLanguages, (err, availableLanguages) => {

        let _availableLanguage: string[] = JSON.parse(availableLanguages)

        redisClient.get(LanguageKeys.DefaultLanguage, (err, _defaultLanguage) => {

            if (_defaultLanguage && _availableLanguage) {

                // If default and available languages are already stored in memory, do nothing and return callback
                callback(null, _defaultLanguage, _availableLanguage)

                return
            }

            // Index all languages from database
            SystemLanguageModel.find({}, (err, languages) => {

                if (err) {

                    callback(err);

                    Monolog({
                        message: 'Failed to look up for a system language',
                        error: err
                    })
                    return
                }

                let _defaultLanguageCode = 'en'
                let availableLanguages = ['en']

                if (languages && languages.length) {

                    availableLanguages = languages.map(_lang => _lang.code)

                    // Filter languages to find the default one
                    _defaultLanguageCode = languages.find(_lang => _lang.default).code

                } else {
                    Monolog({
                        message: 'No languages in DB found falling back to default `en`',
                        error: err
                    })
                }

                // Store all available languages on the system in memory for faster retrieval
                redisClient.set(LanguageKeys.AvailableLanguages, JSON.stringify(availableLanguages))

                // Store default language code in memory
                redisClient.set(LanguageKeys.DefaultLanguage, _defaultLanguageCode)


                callback(err, _defaultLanguageCode, availableLanguages)
            })
        })
    })
}