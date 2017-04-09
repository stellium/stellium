import {MediaFileSchema} from './media_file'
import {EcommerceProductSchema} from './ecommerce_product'


export interface EcommerceProductVariantSchema {
    _id?: string;

    product_id: string;
    product: EcommerceProductSchema;

    thumbnail_id: string;
    thumbnail: MediaFileSchema;

    options: {
        key: string;
        value: string;
    }[];
    pricing: {
        price: number;
        compare_at: number;
        charge_tax: boolean;
    }

    sku: string;
    barcode: string;
    track_inventory: boolean;
    allow_preorder: boolean;
    quantity: number;

    require_shipping: boolean;
    weight: number;
    weight_unit: string;
    fulfillment_service_id: string;

    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
