import {BlogPostModel} from '../../../../../@stellium-database'
import {Monolog, CommonErrors} from '../../../../../@stellium-common'


export const getPostById = (req, res, next) => {


    /**
     * TODO(security): Introduce role id middleware
     * @date - 4/26/17
     * @time - 2:49 PM
     */
    BlogPostModel.findById(req.params.postId, (err, post) => {

        if (err) {
            res.status(500).send(CommonErrors.InternalServerError)
            Monolog({
                message: 'Error occurred while getting post by _id',
                error: err
            })
            return
        }

        res.send(post)
    })
}
