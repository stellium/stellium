import * as mongoose from 'mongoose'
import {WebsiteNavigationSchema} from '../../@stellium-common'


export interface MongooseWebsiteNavigationSchema extends WebsiteNavigationSchema, mongoose.Document {
    _id: any;
}


const Schema = new mongoose.Schema({
    title: {
        type: mongoose.Schema.Types.Mixed
    },
    tooltip: {
        type: mongoose.Schema.Types.Mixed
    },
    order: Number,
    link: {
        source: String,
        url: {
            type: mongoose.Schema.Types.Mixed
        },
    },
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WebsiteNavigationGroup'
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WebsiteNavigation'
    },
    hide: Boolean,
    new_tab: Boolean,
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
});

Schema.virtual('parent', {
    ref: 'WebsiteNavigation',
    localField: 'parent_id',
    foreignField: '_id',
    justOne: true,
});

Schema.virtual('group', {
    ref: 'WebsiteNavigationGroup',
    localField: 'group_id',
    foreignField: '_id',
    justOne: true,
});

export const WebsiteNavigationModel = mongoose.model<MongooseWebsiteNavigationSchema>('WebsiteNavigation', Schema, 'website_navigation');
