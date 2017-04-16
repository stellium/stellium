import * as mongoose from 'mongoose'
import {CustomCollectionBlueprintSchema} from '../../@stellium-common'


export interface MongooseCustomCollectionBlueprintSchema extends CustomCollectionBlueprintSchema, mongoose.Document {
    _id: any;
}


const Schema = new mongoose.Schema({
    collection_name: String,
    tags: [String],
    meta: {
        title: {
            type: mongoose.Schema.Types.Mixed
        },
        url: {
            type: mongoose.Schema.Types.Mixed
        },
        meta: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    content: [{
        type: {
            type: String
        },
        label: String,
        field: String,
        required: {
            type: Boolean,
            default: false
        },
        translatable: {
            type: Boolean,
            default: false
        },
        validations: [{type: mongoose.Schema.Types.Mixed}]
    }],
    status: {
        type: Boolean,
        default: true
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


Schema.virtual('members', {
    ref: 'CustomCollection',
    localField: '_id',
    foreignField: 'collection_id',
})


export const CustomCollectionBlueprintModel = mongoose.model<MongooseCustomCollectionBlueprintSchema>('CustomCollectionBlueprint', Schema, 'custom_collection_blueprints')
