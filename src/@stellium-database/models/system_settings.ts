import * as mongoose from 'mongoose'
import {Document, Model} from 'mongoose'
import {SystemSettingsSchema} from '../../@stellium-common'


export interface MongooseSystemSettingsDocument extends Document, SystemSettingsSchema {
    _id: any
}


const Schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true,
        unique: true
    },
    messages: [{
        /**
         * TODO(security): Change match type to enums of allowed types
         * @date - 07 Apr 2017
         * @time - 12:36 PM
         */
        match: String,
        value: mongoose.Schema.Types.Mixed,
        color: String,
        description: String
    }],
    locked: {
        type: Boolean,
        'default': false
    },
    allowed_roles: {
        type: [Number],
        'default': [1]
    },
    type: {
        type: String
    },
    settings_group: String,
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
})


export const SystemSettingsModel = <Model<MongooseSystemSettingsDocument>>mongoose.model('SystemSettings', Schema, 'system_settings')
