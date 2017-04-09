import * as mongoose from 'mongoose'
import {BlogPostSchema} from '../../@stellium-common'


export interface MongooseBlogPostSchema extends BlogPostSchema, mongoose.Document {
    _id: any;
}


const Schema = new mongoose.Schema({
    title: String,
    url: String,
    meta: String,
    cover: {
        source: String,
        url: String,
        alt: String,
    },
    tags: [{type: String}],
    content: [{
        type: {
            type: String
        },
        order: Number,
        content: mongoose.Schema.Types.Mixed,
    }],
    status: Boolean,
    language: String,
    metrics: {
        likes: {
            facebook: {
                type: Number,
                'default': 0
            },
            medium: {
                type: Number,
                'default': 0
            },
            google: {
                type: Number,
                'default': 0
            },
        },
        views: {
            type: Number,
            'default': 0
        },
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    },
    created_at: {
        type: Date,
        'default': Date.now
    },
    updated_at: {
        type: Date,
        'default': Date.now
    },
    deleted_at: {
        type: Date,
        'default': null
    }
}, {
    toObject: {
        virtuals: true
    }
})


Schema.virtual('user', {
    ref: 'SystemUser',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true
})


export const BlogPostModel = mongoose.model<MongooseBlogPostSchema>('BlogPost', Schema, 'blog_posts')
