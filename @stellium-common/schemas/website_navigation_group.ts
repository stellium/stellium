import {WebsiteNavigationSchema} from "./website_navigation";


export interface WebsiteNavigationGroupSchema {
    _id?: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
    title: string;
    'default': boolean;
    children: WebsiteNavigationSchema[];
    user_id?: string;
}
