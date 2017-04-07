import * as mongoose from 'mongoose'
import {SystemUserSchema} from '../../@stellium-common'
import * as passportLocalMongoose from 'passport-local-mongoose'
import {Document, Model} from "mongoose";


export interface MongooseSystemUserDocument extends Document, SystemUserSchema {
    _id: any
    _doc: SystemUserSchema
    password: string
    register: (user: MongooseSystemUserDocument, password: string, callback) => void
    authenticate: (password?: string, cb?: (err: any, user?: MongooseSystemUserDocument) => void) => void
    setPassword: (newPassword: string, cb: (err: any) => void) => void
}


export interface MongooseSystemUserSchema extends Model<MongooseSystemUserDocument> {
    _id: any
    serializeUser: () => void
    deserializeUser: () => void
    register: (user: MongooseSystemUserDocument, password: string, callback) => void
    authenticate: (password?: string, cb?: (err: any, user?: MongooseSystemUserDocument) => void) => void
    setPassword: (newPassword: string, cb: (err: any) => void) => void
}


const Schema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'A user must have a first name']
    },
    last_name: {
        type: String,
        'default': ''
    },
    image: {
        type: String,
        'default': null
    },
    username: {
        unique: [true, 'A user with that username address exists. The username must be unique.'],
        type: String,
        lowercase: true,
        required: [true, 'A user must have a username to log in']
    },
    email: {
        unique: [true, 'A user with that email address exists. The email must be unique.'],
        type: String,
        lowercase: true,
        required: [true, 'A user must have an email address']
    },
    role_id: {
        // User roles: super admin, admin, manager, analyst
        type: Number,
        // 0 is the master developer, normal users would be assigned
        // a role id between 1 and 5
        min: 0,
        max: 5
    },
    status: {
        type: Boolean,
        'default': true
    },
    last_login: {
        type: Date,
        'default': null
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
})

Schema.plugin(passportLocalMongoose, {
    usernameField: 'email'
})


export const SystemUserModel = <MongooseSystemUserSchema>mongoose.model('SystemUser', Schema, 'system_users')
