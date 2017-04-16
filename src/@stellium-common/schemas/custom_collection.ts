import {HasUser, SoftDelete, Translatable} from './_common'


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
export interface CustomCollectionSchema extends HasUser, SoftDelete {
    _id?: string
    collection_id?: string
    meta?: {
        title: Translatable,
        url: Translatable,
        meta: Translatable
    }
    content?: {
        field: string,
        value: any
    }[]
}
