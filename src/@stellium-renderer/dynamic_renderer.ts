import * as express from 'express'
import {WebsitePageModel, readSeederFile} from '../@stellium-database'
import {ENV, LanguageKeys, Monolog} from '../@stellium-common'
import {ResolveDatabaseDependencies} from './database_resolver'
import {CommonRenderer} from './common_renderer'


export const ResolvePageDocument = (url: string, language: string, cb: (err: any, page?: any) => void): void => {

    if (ENV.render_from_json) {

        readSeederFile('pages', (err, pages) => {

            readSeederFile('navigation', (err, navigation) => {

                if (DEVELOPMENT) console.log('_page.url', url)

                let page = pages.filter(_page => _page.url[language] === url)[0]

                if (!page) {
                    cb('not found', null)
                    return
                }

                page['navigation_group'] = {navigation}

                cb(null, page)
            })
        })

    } else {
        WebsitePageModel
        .findOne({[`url.${language}`]: url, status: true})
        .populate({
            path: 'navigation_group',
            populate: {
                path: 'navigation'
            }
        })
        .exec((err, page) => {

            if (!page) {
                cb('not found')
                return
            }

            cb(err, page)
        })
    }
}


export const DynamicRenderer = (req: express.Request,
                                res: express.Response,
                                next: express.NextFunction) => {

    // Remove leading and trailing slashes
    let url = req.url.replace(/^\/+|\/+$/g, '')

    if (url.includes('?')) [url,] = url.split('?')

    // Get currently active language code
    let currentLanguage = req.app.get(LanguageKeys.CurrentLanguage)


    ResolvePageDocument(url, currentLanguage, (err, page) => {

        if (err) {
            // Page does not exists
            if (err === 'not found') {
                next()
                return
            }
            res.sendStatus(500)
            if (DEVELOPMENT) {
                Monolog({
                    message: 'Error finding page by URL for ' + url,
                    error: err
                })
            }
            return
        }

        const pageData = {
            page: page,
            meta: {
                description: page.meta[currentLanguage],
                title: page.title[currentLanguage],
                url: page.url[currentLanguage],
            },
            cache: true,
            navigation: page.navigation_group.navigation,
            dynamicContent: true
        }

        /**
         * Resolve database dependencies embedded in any module used in the currently requested page
         *
         * e.g. the blog index page might have a module that display a list of available blog posts
         * this modules may request access to database and query the blog_post collection
         */
        ResolveDatabaseDependencies(pageData.page, (err, resolved) => {

            // Replace the stored page Object with the resolved version
            pageData.page = resolved

            CommonRenderer(req, res, pageData)
        })
    })
}