import {SystemUserSchema} from "./system_user";


export interface MediaFolderSchema {
    title: string;
    url: string;
}


export interface MediaFileSchema {
    _id?: string;
    url: string;
    title: string;
    folder: string;
    type: string;
    size: number;
    width: number;
    height: number;
    description: string;
    trash_name: string;
    user_id: any;
    user: SystemUserSchema;
    created_at: Date;
    updated_at: Date;
}
