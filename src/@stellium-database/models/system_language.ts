import * as mongoose from 'mongoose';
import {LanguageSchema} from "../../@stellium-common";


export interface MongooseLanguageSchema extends mongoose.Document, LanguageSchema {
    _id: any;
}


const Schema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'The title of the language is required']
    },
    code: {
        type: String,
        unique: [true, 'Cannot add a language that has been added']
    },
    'default': {
        type: Boolean,
        'default': false
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    },
    status: {
        type: Boolean,
        'default': true
    },
    created_at: {
        type: Date,
        'default': Date.now
    },
    updated_at: {
        type: Date,
        'default': Date.now
    }
});

Schema.virtual('user', {
    ref: 'SystemUser',
    localField: 'user_id',
    foreignField: '_id'
});


export const SystemLanguageModel = mongoose.model<MongooseLanguageSchema>('SystemLanguages', Schema, 'system_languages');

