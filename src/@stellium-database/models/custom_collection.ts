import * as mongoose from 'mongoose';
import {CustomCollectionSchema} from "../../@stellium-common";


export interface MongooseCustomCollectionSchema extends CustomCollectionSchema, mongoose.Document {
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
    children_ids: [{
        type: mongoose.Schema.Types.Mixed,
        ref: 'WebsiteNavigation'
    }],
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

Schema.virtual('children', {
    ref: 'WebsiteNavigation',
    localField: 'children_ids',
    foreignField: '_id',
});

export const CustomCollectionModel = mongoose.model<MongooseCustomCollectionSchema>('CustomCollection', Schema, 'custom_collection');
