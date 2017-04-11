import * as express from 'express'
import {Router} from 'express'
import {BlogPostModel} from '../../../@stellium-database/models/blog_post'
import {Monolog} from '../../../@stellium-common/monolog/monolog'
import {CommonRenderer} from '../../../@stellium-renderer/common_renderer'


export const CustomRouteBundle: Router = express.Router()

CustomRouteBundle.get('/news-press/:postUrl', (req, res, next) => {

    if (!req.get('host').includes('growbali')) {
        next()
        return
    }

    BlogPostModel.findOne({url: req.params['postUrl']}, (err, post) => {

        if (err) {
            Monolog({
                message: 'Could not retrieve offer detail object in detail controller',
                error: err
            })
            res.status(500).send()
            return
        }

        if (!post) {
            next()
            return
        }

        const pageData = {
            dynamicContent: true,
            meta: {
                title: post.title,
                image: post.cover.url,
                og_type: 'article',
                description: post.meta
            },
            page: {
                title: {
                    en: post.title,
                },
                meta: {
                    en: post.meta
                },
                modules: [
                    {
                        template: 'parallax/image-full',
                        status: true,
                        config: {
                            background: post.cover,
                        },
                        data: null
                    },
                    {
                        template: 'posts/post-detail',
                        data: post.content,
                        config: post
                    }
                ]
            }
        }

        CommonRenderer(req, res, pageData, (err, html) => {

            res.send(html)
        })
    })
})
