import {BlogPostModel} from '../../../../../@stellium-database'
import {Monolog, CommonErrors} from '../../../../../@stellium-common'
import {DeletePageCache} from '../../../resource_cache'


export const updateBlogPost = (req, res, next) => {


    /**
     * TODO(security): Introduce role id middleware
     * @date - 4/26/17
     * @time - 2:49 PM
     */
    BlogPostModel.findByIdAndUpdate(req.params.postId, req.body, err => {

        if (err) {
            res.status(500).send(CommonErrors.InternalServerError)
            Monolog({
                message: 'Error occurred while updating post',
                error: err
            })
            return
        }

        res.send({
            message: 'Post has been updated successfully'
        })

        DeletePageCache()
    })
}
