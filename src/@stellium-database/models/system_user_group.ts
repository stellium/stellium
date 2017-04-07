import * as mongoose from 'mongoose';
import {SystemUserGroupSchema} from "../../@stellium-common";


export interface MongooseSystemUserGroupSchema extends SystemUserGroupSchema, mongoose.Document {
    _id: any;
}


const Schema = new mongoose.Schema({
    group: {
        type: String,
        required: true
    },
    info: {
        type: String,
        required: true
    },
    role_id: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        'default': Date.now
    },
    updated_at: {
        type: Date,
        'default': Date.now
    },
});

export const SystemUserGroupModel = mongoose.model<MongooseSystemUserGroupSchema>('SystemUserGroup', Schema, 'system_user_groups');
