import * as express from 'express'
import {Router} from 'express'
import {BlogPostsRouter} from './posts/index'


export const BlogBundleRouter: Router = express.Router()

BlogBundleRouter.use('/posts', BlogPostsRouter)
