import * as mongoose from 'mongoose'


export interface MonologSchema {
    file_path?: string;
    line_number?: number;
    message?: string;
    error?: any;
    severity?: 'severe' | 'moderate' | 'light' | 'ignore';
    status?: 'created' | 'transported' | 'read' | 'resolved';
    created_at?: Date;
}

/** Need to extend merge mongoose.Document and Schema to be able to reuse schema in Angular / Non-node.js environment */
export interface Mo_MonologSchema extends mongoose.Document, MonologSchema {}


const Schema = new mongoose.Schema({
    file_path: {
        type: String,
        'default': 'No file path defined'
    },
    line_number: {
        type: Number,
        'default': 0
    },
    message: {
        type: String,
        'default': 'NOMSG'
    },
    error: {
        type: mongoose.Schema.Types.Mixed,
        'default': 'NOERR'
    },
    severity: {
        type: String,
        enum: ['severe', 'moderate', 'light', 'ignore'],
        'default': 'severe'
    },
    status: {
        type: String,
        enum: ['created', 'transported', 'read', 'resolved'],
        'default': 'created'
    },
    created_at: {
        type: Date,
        'default': Date.now
    }
});


export const MonologModel = mongoose.model<Mo_MonologSchema>('SystemLog', Schema, 'system_log');

