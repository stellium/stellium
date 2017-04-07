import {SystemUserSchema} from "./system_user";


export interface LanguageSchema {
    _id?: string;
    title: string;
    code: string;
    'default': boolean;
    user_id: string;
    user?: SystemUserSchema;
    status: boolean;
    created_at?: Date;
    updated_at?: Date;
}
