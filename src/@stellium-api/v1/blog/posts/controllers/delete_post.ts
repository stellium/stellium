import {BlogPostModel} from '../../../../../@stellium-database'
import {Monolog, CommonErrors} from '../../../../../@stellium-common'
import {DeletePageCache} from '../../../resource_cache'


export const deleteBlogPost = (req, res, next) => {

    BlogPostModel.findByIdAndRemove(req.params.postId, err => {

        if (err) {
            res.status(500).send(CommonErrors.InternalServerError)
            Monolog({
                message: 'Error occurred while deleting post',
                error: err
            })
            return
        }

        res.send({
            message: 'Post has been deleted successfully'
        })

        DeletePageCache()
    })
}
