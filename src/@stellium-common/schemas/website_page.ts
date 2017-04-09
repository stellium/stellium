import {SystemUserSchema} from './system_user'
import {WebsiteNavigationGroupSchema} from './website_navigation_group'
import {Translatable} from './_common'


export interface WebsitePageModuleSchema {
    order: number;
    title: string;
    'protected': boolean;
    data: any[];
    config: any;
    global: boolean;
    status: boolean;
    template: string;
}

export interface WebsitePageSchema {
    _id?: string;
    id?: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
    title: Translatable;
    meta: Translatable;
    url: Translatable;
    navigation_group_id: string;
    navigation_group: WebsiteNavigationGroupSchema;
    'protected': boolean;
    'default': boolean;
    cache: boolean;
    status: boolean;
    template: string;
    theme_variables: {[key: string]: any};
    modules: WebsitePageModuleSchema[];
    body_class: string;
    user_id: string;
    user: SystemUserSchema;
}
