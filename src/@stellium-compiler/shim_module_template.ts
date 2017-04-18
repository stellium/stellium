import * as async from 'async'
import * as redis from 'redis'
import {ENV} from '../@stellium-common'
import {WebsitePageModel} from '../@stellium-database'
import {CacheKeys, AttributeKeys} from '../@stellium-common'

const redisClient = redis.createClient({db: ENV.redis_index})


/**
 * Returns a random string of 3 characters
 * @param length
 * @returns {string}
 */
const createUniqueModuleIdentifier = (length: number = 3): string => {

    let identifier = ''

    let chars = 'abcdefghijklmnopqrstuvwxyz'

    let charLength = chars.length

    for (let i = 0; i < length; i++) identifier += chars.charAt(Math.floor(Math.random() * charLength))

    return identifier
}


// Double cache key collision precaution
let _moduleIndex = 1


const ensureSafeTemplateUrl = (templateUrl: string) => templateUrl.replace(/\//g, '_').replace(/-/g, '_')


const saveToCache = (template: string, cb: (err: any) => void): void => {

    redisClient.set(
        CacheKeys.ModuleShimPrefix + ensureSafeTemplateUrl(template),
        `${AttributeKeys.ModuleShimPrefix}-${createUniqueModuleIdentifier()}-${++_moduleIndex}`
    , err => cb(err))
}


/**
 * Fetched all available modules and saves their template URL into
 * cache for emulated hoisting
 *
 * sliders/full-image => mt-module-xyz-12
 *
 * @param cb
 * @constructor
 */
export const ShimModuleTemplateUrls = (cb: (err: any) => void): void => {

    WebsitePageModel.find({}, (err, allPages) => {

        let uniqueModuleTemplateUrls = []

        allPages.forEach(_page => {

            _page.modules.forEach(_module => {

                if (!uniqueModuleTemplateUrls.includes(_module.template)) {

                    uniqueModuleTemplateUrls.push(_module.template)
                }
            })
        })

        async.map(uniqueModuleTemplateUrls, saveToCache, err => {
            cb(err)
        })
    })
}
