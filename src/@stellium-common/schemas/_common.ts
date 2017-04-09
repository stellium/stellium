import {SystemUserSchema} from './system_user'
export interface Translatable {
    [code: string]: any
}

export type DDate = Date | number;

export interface Timestamps {
    created_at?: DDate;
    updated_at?: DDate;
}

export interface SoftDelete extends Timestamps {
    deleted_at?: DDate;
}

export interface Identification {
    id?: number | string;
    _id?: number | string;
}

export interface SEOFields {
    title?: string;
    meta?: string;
    url?: string;
}

export interface TranslatableSEOFields {
    title?: Translatable;
    meta?: Translatable;
    url?: Translatable;
}


export interface HasUser {
    user_id?: string;
    user?: SystemUserSchema;
}

// Internal
export interface Credentials {
    hash: string;
    salt: string;
}
