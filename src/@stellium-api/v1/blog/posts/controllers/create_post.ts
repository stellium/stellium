import {BlogPostModel} from '../../../../../@stellium-database'
import {Monolog, CommonErrors} from '../../../../../@stellium-common'
import {DeletePageCache} from '../../../resource_cache'


export const createBlogPost = (req, res, next) => {

    const postObject = req.body

    postObject.user_id = req.user._id

    BlogPostModel.create(postObject, err => {

        if (err) {
            res.status(500).send(CommonErrors.InternalServerError)
            Monolog({
                message: 'Error creating new post',
                error: err
            })
            return
        }

        res.send({
            message: `Post ${postObject.title} created successfully`
        })

        DeletePageCache()
    })
}
