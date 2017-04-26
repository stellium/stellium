import {BlogPostModel} from '../../../../../@stellium-database'
import {Monolog} from '../../../../../@stellium-common/monolog/monolog'
import {CommonErrors} from '../../../../../@stellium-common/keys/errors'


export const indexPosts = (req, res, next): void => {

    /**
     * TODO(security): Introduce posts filtering by role id
     * @date - 4/26/17
     * @time - 2:45 PM
     */
    BlogPostModel.find({deleted_at: null}, (err, posts) => {

        if (err) {
            res.status(500).send(CommonErrors.InternalServerError)
            Monolog({
                message: 'Error retrieving list of posts',
                error: err
            })
            return
        }

        res.send(posts)
    })
}
