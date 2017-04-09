import * as fs from 'fs'
import * as glob from 'glob'
import * as path from 'path'
import * as async from 'async'
import * as redis from 'redis'
import * as express from 'express'
import {Router} from 'express'
import {ENV, minifyTemplate, Monolog, ViewsPath, LanguageKeys} from '../../../@stellium-common'
import {CommonRenderer, ResolveDatabaseDependencies} from '../../../@stellium-renderer';
import {CacheKeys} from '../../../@stellium-common/keys/cache_keys'


const redisClient = redis.createClient()


export const StelliumRouter: Router = express.Router()


const scanComponentFiles = (cb) => {
    const options = {
        'ignore': ['modules/footers', 'modules/header', 'modules/partials', 'modules/pages']
    }
    glob(path.resolve(ViewsPath, 'modules/**/component.json'), options, (err, files) => cb(err, files))
}


const mapComponentModules = (files, cb) => {

    let modules = []

    const addModuleToMap = (filePath, cb) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            modules.push(JSON.parse(data))
            cb(err)
        })
    }

    async.map(files, addModuleToMap, (err) => cb(err, modules))
}


StelliumRouter.get('/modules-index', (req, res) => {

    let indexKey = 'stellium-modules-index'

    redisClient.select(ENV.redis_index, err => {

        if (err) {
            Monolog({
                message: 'Unable to select redis database at index ' + ENV.redis_index,
                error: err,
                severity: 'severe'
            })
            res.status(500).send('Fatal error while attempting to select redis database by index')
            return
        }

        redisClient.get(indexKey, (err, cachedModules) => {

            if (err) {
                Monolog({
                    message: 'Error while attempting to index modules',
                    error: err
                })
                res.sendStatus(500)
            }

            if (cachedModules) {
                res.send(cachedModules)
                return
            }

            async.waterfall([
                scanComponentFiles,
                mapComponentModules,
            ], (err, modules) => {

                if (err) {
                    res.sendStatus(500)
                    Monolog({
                        message: 'Error indexing modules to populate module picker',
                        error: err
                    })
                    return
                }
                res.send(modules)

                // Cache scanned modules to redis for fast retrieval
                redisClient.set(indexKey, JSON.stringify(modules))
            })
        })
    })
})


StelliumRouter.post('/prebuild-template', (req, res) => {

    let page = req.body

    // Let the common renderer know that we are requesting
    // a version of the page editor compatible HTML string
    // the renderer will inject all necessary dependencies
    // into the page
    req.app.set(CacheKeys.IFrameMode, true)

    req.app.set(LanguageKeys.CurrentLanguage, req.query.language)

    ResolveDatabaseDependencies(page, (err, resolvedPage) => {

        if (err) {
            Monolog({
                message: 'Failed resolving database dependencies page',
                error: err
            })
            res.sendStatus(500)
            return
        }

        const pageData = {
            page: resolvedPage,
            meta: {
                description: page.meta.en,
                title: page.title.en,
                url: page.url.en,
            },
            dynamicContent: true
        }

        CommonRenderer(req, res, pageData, (err, renderedPage) => {

            if (err) {
                Monolog({
                    message: 'Failed rendering page',
                    error: err
                })
                res.sendStatus(500)
                return
            }

            // Head script to allow cross origin iFrame access and manipulation using JavaScript
            let iframeGate = `<script>document.domain = "${ENV.stellium_domain}";</script>`

            //noinspection ES6ConvertVarToLetConst,JSUnusedLocalSymbols
            let iframeMode = `<script>var StelliumIFrameMode = true</script>`

            renderedPage = renderedPage.replace(`<base href="/">`, `<base href="http://${ENV.stellium_domain}/">${iframeGate}`)

            const iFrameDependencies =
                `<script src="//cdn.jsdelivr.net/medium-editor/latest/js/medium-editor.min.js"></script>
                 <link rel="stylesheet" href="//cdn.jsdelivr.net/medium-editor/latest/css/medium-editor.min.css"
                       type="text/css" media="screen" charset="utf-8">
                 <link rel="stylesheet" href="//cdn.jsdelivr.net/medium-editor/latest/css/themes/beagle.min.css"
                       type="text/css" media="screen" charset="utf-8">
                 <link rel="stylesheet" href="css/medium-editor.css" type="text/css">
            `

            renderedPage = renderedPage.replace('<!--iframe-->', `${iFrameDependencies}`)

            let renderData = {
                page: minifyTemplate(renderedPage, true),
            }
            res.send(renderData)
        })
    })
})
