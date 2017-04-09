import * as mongoose from 'mongoose'
import "./website_navigation";
import {WebsiteNavigationGroupSchema} from '../../@stellium-common'


export interface MongooseWebsiteNavigationGroupSchema extends WebsiteNavigationGroupSchema, mongoose.Document {
    _id: any;
}


const Schema = new mongoose.Schema({
    title: {
        type: String
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    },
    'default': Boolean,
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

Schema.virtual('navigation', {
    ref: 'WebsiteNavigation',
    localField: '_id',
    foreignField: 'group_id',
});

export const WebsiteNavigationGroupModel = mongoose.model<MongooseWebsiteNavigationGroupSchema>(
    'WebsiteNavigationGroup',
    Schema,
    'website_navigation_group'
);
