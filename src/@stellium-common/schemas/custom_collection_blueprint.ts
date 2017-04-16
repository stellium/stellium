import {HasUser, SoftDelete, Translatable} from './_common'
import {CustomCollectionSchema} from './custom_collection'


export interface CustomCollectionBlueprintContent {
    type: string
    label: string
    field: string
    required: boolean
    translatable: boolean
    validations: any[]
}


export interface CustomCollectionBlueprintSchema extends HasUser, SoftDelete {
    collection_name: string,
    tags: string[],
    meta: {
        title: Translatable,
        url: Translatable,
        meta: Translatable
    },
    content: CustomCollectionBlueprintContent[],
    members: CustomCollectionSchema[],
    status: boolean
}
