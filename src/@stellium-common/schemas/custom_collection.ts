import {WebsiteNavigationGroupSchema} from './website_navigation_group'
import {Translatable} from './_common'


/**
 *
 * Example 1:
 * Custom Collection: Hotel Rooms
 *
 * Attribute Set: Hotel Room
 * [
 *      {
 *          order: 1,
 *          key: 'title',
 *          type: 'text'
 *      },
 *      {
 *          order: 2,
 *          key: 'price',
 *          type: 'number'
 *      }
 * ]
 */


export interface CustomCollectionSchema {
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
    parent?: CustomCollectionSchema;
    hide: boolean;
    new_tab: boolean;
    children?: CustomCollectionSchema[];
    user_id?: string;
}
