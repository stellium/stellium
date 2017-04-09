import {EcommerceProductVariantSchema} from './ecommerce_product_variant'


export interface EcommerceCartSchema {
    _id?: string;
    session_id: string;
    variant_id: string;
    customer_id: string;
    quantity: number;
    created_at?: Date;
    updated_at?: Date;

    variant: EcommerceProductVariantSchema,
}
