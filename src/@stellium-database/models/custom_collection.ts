import * as mongoose from 'mongoose'
import {CustomCollectionSchema} from '../../@stellium-common'


export interface MongooseCustomCollectionSchema extends CustomCollectionSchema, mongoose.Document {
    _id: any;
}


const Schema = new mongoose.Schema({
    collection_id: mongoose.Schema.Types.ObjectId,
    meta: {
        title: mongoose.Schema.Types.Mixed,
        url: mongoose.Schema.Types.Mixed,
        meta: mongoose.Schema.Types.Mixed,
    },
    content: [{
        field: String,
        value: mongoose.Schema.Types.Mixed
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
})

Schema.virtual('parent', {
    ref: 'CustomCollectionBlueprint',
    localField: 'collection_id',
    foreignField: '_id',
    justOne: true
})

export const CustomCollectionModel = mongoose.model<MongooseCustomCollectionSchema>('CustomCollection', Schema, 'custom_collection');
