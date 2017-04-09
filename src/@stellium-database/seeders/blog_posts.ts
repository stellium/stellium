import * as async from 'async';
import {SeedConsole, FindOneUser, readSeederFile} from "./_lib";
import {BlogPostModel} from "../models/blog_post";


const removeBlogPosts = (cb: (err: any) => void): void => {
    BlogPostModel.remove({}, err => cb(err))
};


let postIndex = 0
const populateMetaDataAndSave = (user) => (postItem, cb): void => {

    postItem.user_id = user._id

    postItem.cover = {...postItem.cover, alt: postItem.title}

    postItem.language = 'en'

    postItem.tags = postItem.title.toLowerCase().split(' ')

    let d = new Date()

    d.setDate(d.getDate() - ++postIndex)

    postItem.created_at || (postItem.created_at = d)

    if (!postItem.content) {

        postItem.content = [
            {
                order: 1,
                content: `<p>${postItem.meta}</p>`,
                type: 'text'
            }
        ]
    }

    postItem.status = true

    BlogPostModel.create(postItem, err => cb(err))
}


const iterateAndSaveBlogPosts = (user, cb): void => {
    readSeederFile('posts', (err, posts) => {
        async.map(posts, populateMetaDataAndSave(user), err => cb(err))
    })
}


const seedBlogPosts = (cb: (err: any) => void): void => {
    async.waterfall([
        FindOneUser,
        iterateAndSaveBlogPosts
    ], err => cb(err))
}


export const BlogPostsSeeder = (cb: (err: any) => void) => {
    SeedConsole("Seeding Blog Posts")
    async.series([
        removeBlogPosts,
        seedBlogPosts
    ], err => cb(err))
}
