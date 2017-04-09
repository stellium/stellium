import {MediaFileSchema} from './media_file'
import {SystemUserSchema} from './system_user'
import {Translatable} from './_common'
import {EcommerceProductVariantSchema} from './ecommerce_product_variant'


export interface VariantOptions {
    key: string;
    label: Translatable;
    values: string[];
}


export interface InclusionObject {
    include: string;
    exclude: string;
}

export interface Visibility {
    countries: InclusionObject;
    languages: InclusionObject;
    sales_channel_ids: string[];
}


export interface EcommerceProductSchema {
    _id?: string;

    title: Translatable;
    url: Translatable;
    meta: Translatable;
    description: Translatable;

    tags: string[];
    gallery_ids: string[];
    gallery: MediaFileSchema[];
    variant_options: VariantOptions;

    variants?: EcommerceProductVariantSchema[];

    collection_id: string;
    type_id: string;
    visibility: Visibility;
    user_id: string;

    user?: SystemUserSchema;

    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
