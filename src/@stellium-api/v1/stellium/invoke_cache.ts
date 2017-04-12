import * as fs from 'fs'
import * as path from 'path'
import * as async from 'async'
import * as mkdirp from 'mkdirp'
import * as rimraf from 'rimraf'
import * as express from 'express'
import * as request from 'request'
import {Router} from 'express'
import {WebsitePageModel} from '../../../@stellium-database/models/website_page'
import {SystemLanguageModel} from '../../../@stellium-database/models/system_language'
import {CachePath} from '../../../@stellium-common/path/common_paths'
import {Monolog} from '../../../@stellium-common/monolog/monolog'


export const StelliumCacheRouter: Router = express.Router()


let _loadProgress = 0


const invokeCache = (baseDomain: string) => (pageUrl: string, cb: (err: any) => void): void => {

    const saveStream = fs.createWriteStream(path.resolve(CachePath, 'page-cache', pageUrl + '.html'))

    saveStream.on('finish', err => {
        cb(err)
    })

    const options = {
        url: `http://${baseDomain}/${pageUrl}`,
        headers: {
            'Stellium-Cache': 'false'
        }
    }

    request(options).pipe(saveStream)
}


StelliumCacheRouter.get('/cache-pages', (req, res) => {

    WebsitePageModel.find({cache: true}, (err, pages) => {

        SystemLanguageModel.find({status: true}, (err, langs) => {

            const languages = langs.map(_lang => _lang.code)

            let pageUrls = []

            pages.forEach(_page => {

                languages.forEach(_lang => {

                    pageUrls = [].concat(pageUrls, _page.url[_lang])
                })
            })

            res.send({
                message: 'Pages are being cached, you will be notified once the operation has completed'
            })

            const pageCachePath = path.resolve(CachePath, 'page-cache')

            rimraf(pageCachePath, err => {

                if (err) {
                    Monolog({
                        message: 'Unable to rimraf page-cache directory',
                        error: err
                    })
                    return
                }

                mkdirp(pageCachePath, err => {

                    if (err) {
                        Monolog({
                            message: 'Unable to create page-cache directory',
                            error: err
                        })
                        return
                    }

                    const cacheFunction = invokeCache(req.get('host'))

                    async.map(pageUrls, cacheFunction, err => {

                        if (err) {
                            Monolog({
                                message: 'Unable to completely cache all pages',
                                error: err
                            })
                        }
                    })
                })
            })
        })
    })
})
