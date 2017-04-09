import * as mongoose from 'mongoose'
import {WebsitePageSchema} from '../../@stellium-common'


export interface MongooseWebsitePageSchema extends WebsitePageSchema, mongoose.Document {
    _id: any;
}


const Schema = new mongoose.Schema({
    title: {
        type: mongoose.Schema.Types.Mixed
    },
    meta: {
        type: mongoose.Schema.Types.Mixed
    },
    url: {
        type: mongoose.Schema.Types.Mixed
    },
    navigation_group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WebsiteNavigation'
    },
    'protected': Boolean,
    'default': Boolean,
    cache: Boolean,
    status: Boolean,
    template: String,
    theme_variables: mongoose.Schema.Types.Mixed,
    modules: [{
        type: mongoose.Schema.Types.Mixed
    }],
    body_class: String,
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
    },
    toJSON: {
        virtuals: true
    }
})


Schema.virtual('user', {
    ref: 'SystemUser',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true
})


Schema.virtual('navigation_group', {
    ref: 'WebsiteNavigationGroup',
    localField: 'navigation_group_id',
    foreignField: '_id',
    justOne: true,
})

export const WebsitePageModel = mongoose.model<MongooseWebsitePageSchema>('WebsitePage', Schema, 'website_pages');
