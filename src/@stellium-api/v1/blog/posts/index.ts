import * as express from 'express'
import {Router} from 'express'
import {createBlogPost} from './controllers/create_post'
import {deleteBlogPost} from './controllers/delete_post'
import {updateBlogPost} from './controllers/update_post'
import {getPostById} from './controllers/get_post_by_id'
import {indexPosts} from './controllers/index_posts'


export const BlogPostsRouter: Router = express.Router()

BlogPostsRouter.get('/', indexPosts)

BlogPostsRouter.get('/:postId', getPostById)

BlogPostsRouter.post('/', createBlogPost)

BlogPostsRouter.delete('/:postId', deleteBlogPost)

BlogPostsRouter.put('/:postId', updateBlogPost)
