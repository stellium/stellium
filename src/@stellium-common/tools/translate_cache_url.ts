export const translateCacheUrl = (lang: string, url: string): string => {

    url = url.replace(/^\/+|\/+$/g, '');

    url = lang + '_' + url;

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
    ];

    _replaceFromTo.forEach(_rep => url = url.replace(_rep.from, _rep.to));

    url = 'page_cache_address_' + url.toLowerCase();

    return url;
};
