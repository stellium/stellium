import * as mongoose from 'mongoose';
import {EcommerceOrderSchema} from "../../@stellium-common";


export interface MongooseEcommerceOrderSchema extends EcommerceOrderSchema, mongoose.Document {
    _id: any;
}


let AddressInfo = {
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    country: String,
    city: String,
    postal: String,
    address_1: String,
    address_2: String
};


const Schema = new mongoose.Schema({

    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EcommerceCustomer'
    },

    billing: AddressInfo,

    shipping: AddressInfo,

    purchases: [{
        variant_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EcommerceProductVariant'
        },
        quantity: Number,
    }],

    status: String,

    total: Number,

    created_at: {
        type: Date,
        'default': Date.now
    },
    updated_at: {
        type: Date,
        'default': Date.now
    }
}, {
    toObject: {
        virtuals: true
    }
});

export const EcommerceOrderModel = mongoose.model<MongooseEcommerceOrderSchema>('EcommerceOrder', Schema, 'ecommerce_orders');
