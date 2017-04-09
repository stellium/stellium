import {WebsiteNavigationGroupSchema} from './website_navigation_group'
import {Translatable} from './_common'


export interface WebsiteNavigationSchema {
    _id?: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
    title: Translatable;
    tooltip: Translatable;
    order: number;
    link: {
        source: string;
        url: Translatable;
    }
    group_id?: string;
    group?: WebsiteNavigationGroupSchema;
    parent_id?: string;
    parent?: WebsiteNavigationSchema;
    hide: boolean;
    new_tab: boolean;
    user_id?: string;
}
