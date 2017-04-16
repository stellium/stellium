import {CacheKeys} from '../keys/cache_keys'
export const translateCacheUrl = (lang: string, url: string): string => {

    url = url.replace(/^\/+|\/+$/g, '')

    url = lang + '_' + url

    const _replaceFromTo = [
        {
            from: /:+/,
            to: '_'
        },
        {
            from: /^\/+|\/+$/,
            to: ''
        },
        {
            from: /\//g,
            to: '_'
        },
        {
            from: /[-]/g,
            to: '_'
        },
        {
            from: /%20/,
            to: ''
        }
    ]

    _replaceFromTo.forEach(_rep => url = url.replace(_rep.from, _rep.to))

    url = CacheKeys.PageCachePrefix + url.toLowerCase()

    return url
}
