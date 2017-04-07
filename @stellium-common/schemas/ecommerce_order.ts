import {EcommerceProductVariantSchema} from "./ecommerce_product_variant";


export interface EcommerceShippingInfoSchema {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    postal: string;
    address_1: string;
    address_2: string;
}


export interface EcommercePurchasesSchema {
    variant_id: string;
    quantity: number;
    priced_at: number;
    status: 'placed' | 'paid' | 'canceled';

    variant: EcommerceProductVariantSchema;
}


export interface EcommerceOrderSchema {
    _id?: string;
    billing: EcommerceShippingInfoSchema;
    shipping: EcommerceShippingInfoSchema;

    customer_id: string;
    // customer: E_Customer;
    purchases: EcommercePurchasesSchema[];
    total: number;

    created_at?: Date;
    updated_at?: Date;
}
