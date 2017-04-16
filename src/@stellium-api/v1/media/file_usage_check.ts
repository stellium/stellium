import * as async from 'async'
import {WebsitePageSchema, BlogPostSchema} from '../../../@stellium-common'
import {WebsitePageModel, BlogPostModel} from '../../../@stellium-database'


const getPagesForScanning = (cb: (err: any, pages: WebsitePageSchema[]) => void): void => {

    WebsitePageModel.find({}, (err, pages) => cb(err, pages))
}


const getPostsForScanning = (cb: (err: any, posts: BlogPostSchema[]) => void): void => {

    BlogPostModel.find({}, (err, posts) => cb(err, posts))
}


const checkPagesForFileUsage = (pages: WebsitePageSchema[], fileName: string, cb: (err: any, result?: any[]) => void): void => {

    const fileRegex = new RegExp("/" + fileName + "/g")

    const matchedModule = []

    pages.forEach(_page => {

        _page.modules.forEach(_module => {

            const moduleConfig = JSON.stringify(_module.config)

            const moduleData = JSON.stringify(_module.data)

            const configMatch = (moduleConfig.match(fileRegex) || []).length

            console.log('configMatch', configMatch)

            const dataMatch = (moduleData.match(fileRegex) || []).length

            console.log('dataMatch', dataMatch)

            if (configMatch || dataMatch) {

                matchedModule.push({
                    module: _module.template,
                    counts: configMatch + dataMatch
                })
            }
        })
    })

    cb(null, matchedModule)
}


export const FileUsageCheck = (req, res) => {

    const fileUrl = req.query['fileUrl']

    console.log('Check usage for', fileUrl)

    async.parallel({
        pages: <any>getPagesForScanning,
        // posts: <any>getPostsForScanning
    }, (err, results) => {

        checkPagesForFileUsage(<WebsitePageSchema[]>results.pages, `media/${fileUrl}`, (err, matches) => {

            res.send(matches)
        })
    })
}
