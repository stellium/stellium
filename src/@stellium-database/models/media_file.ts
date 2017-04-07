import * as mongoose from 'mongoose';
import {MediaFileSchema} from "../../@stellium-common";
import {Document, Model} from "mongoose";


export interface MongooseMediaFileDocument extends Document, MediaFileSchema {
    _id: any
}


export interface MongooseMediaFileSchema extends Model<MongooseMediaFileDocument> {
    random(cb: (err: any, file?: MediaFileSchema) => void): MediaFileSchema;
}


const Schema = new mongoose.Schema({
    url: {
        type: String
    },
    title: {
        type: String
    },
    folder: {
        type: String
    },
    type: {
        type: String
    },
    size: {
        type: Number
    },
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    description: {
        type: mongoose.Schema.Types.Mixed,
    },
    trash_name: {
        type: String
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

Schema.statics.random = function (callback) {
    this.count(function (err, count) {
        if (err) {
            return callback(err);
        }
        let rand = Math.floor(Math.random() * count);
        this.findOne().skip(rand).exec(callback);
    }.bind(this));
};


export const MediaFileModel = <MongooseMediaFileSchema>mongoose.model('MediaFile', Schema, 'media_files');
