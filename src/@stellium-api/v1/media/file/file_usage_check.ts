import * as async from 'async'
import {WebsitePageSchema, BlogPostSchema} from '../../../../@stellium-common'
import {WebsitePageModel, BlogPostModel} from '../../../../@stellium-database'


const getPagesForScanning = (cb: (err: any, pages: WebsitePageSchema[]) => void): void => {

    WebsitePageModel.find({}, (err, pages) => cb(err, pages))
}


const getPostsForScanning = (cb: (err: any, posts: BlogPostSchema[]) => void): void => {

    BlogPostModel.find({}, (err, posts) => cb(err, posts))
}


const checkPagesForFileUsage = (pages: WebsitePageSchema[], fileName: string, cb: (err: any, result?: any[]) => void): void => {

    const matchedPages = []

    pages.forEach(_page => {

        const matchedModules = []

        _page.modules.forEach(_module => {

            const moduleConfig = JSON.stringify(_module.config)

            const moduleData = JSON.stringify(_module.data)

            const configMatch = (moduleConfig.match(fileName) || []).length

            const dataMatch = (moduleData.match(fileName) || []).length

            if (configMatch || dataMatch) {

                matchedModules.push({
                    module: _module.template,
                    counts: configMatch + dataMatch
                })
            }
        })

        if (matchedModules && matchedModules.length) {

            matchedPages.push({
                page: _page.title['en'],
                modules: matchedModules
            })
        }
    })

    cb(null, matchedPages)
}


export const fileUsageCheck = (req, res) => {

    const fileUrl = req.query['fileUrl']

    async.parallel({
        pages: <any>getPagesForScanning,
        // posts: <any>getPostsForScanning
    }, (err, results) => {

        checkPagesForFileUsage(<WebsitePageSchema[]>results.pages, fileUrl, (err, matches) => res.send(matches))
    })
}
