import * as mongoose from 'mongoose'
import {EcommerceCartSchema} from '../../@stellium-common'


export interface MongooseEcommerceCartSchema extends EcommerceCartSchema, mongoose.Document {
    _id: any;
}


const Schema = new mongoose.Schema({

    session_id: {
        type: String,
        require: true
    },
    variant_id: mongoose.Schema.Types.ObjectId,

    customer_id: mongoose.Schema.Types.ObjectId,

    quantity: {
        type: Number,
        'default': 1
    },
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


Schema.virtual('variant', {
    ref: 'EcommerceProductVariant',
    localField: 'variant_id',
    foreignField: '_id',
    justOne: true
});


Schema.virtual('customer', {
    ref: 'EcommerceCustomer',
    localField: 'customer_id',
    foreignField: '_id',
    justOne: true
});

export const EcommerceCartModel = mongoose.model<MongooseEcommerceCartSchema>('EcommerceCart', Schema, 'ecommerce_cart');
