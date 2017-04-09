import {BlogPostModel} from '../../@stellium-database/models/blog_post'
import {Monolog} from '../../@stellium-common/monolog/monolog'
import {CommonRenderer} from '../../@stellium-renderer/common_renderer'
export const OffersDetailController = (req, res, next) => {



    BlogPostModel.findOne({url: req.params['offerUrl']}, (err, post) => {

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
                        template: "parallax/single-text",
                        status: true,
                        config: {
                            background: post.cover,
                            title: {
                                en: ''
                            }
                        },
                        data: null
                    },
                    {
                        template: 'custom/offer-detail',
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
}
