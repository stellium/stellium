import * as mongoose from 'mongoose'
import {EcommerceProductVariantSchema} from '../../@stellium-common'


export interface MongooseEcommerceProductVariantSchema extends EcommerceProductVariantSchema, mongoose.Document {
    _id: any;
}

const Schema = new mongoose.Schema({

    product_id: mongoose.Schema.Types.ObjectId,

    thumbnail_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MediaFile'
    },

    options: [{
        key: String,
        value: String
    }],

    pricing: {
        price: Number,
        compare_at: Number,
        charge_tax: Boolean
    },

    sku: String,

    barcode: String,

    track_inventory: Boolean,

    allow_preorder: Boolean,

    quantity: Number,

    require_shipping: Boolean,

    weight: Number,

    weight_unit: String,

    fulfillment_service_id: mongoose.Schema.Types.ObjectId,

    created_at: {
        type: Date,
        'default': Date.now
    },
    updated_at: {
        type: Date,
        'default': Date.now
    },
    deleted_at: {
        type: Date,
        'default': null
    }
}, {
    toObject: {
        virtuals: true,
    }
});


Schema.virtual('product', {
    ref: 'EcommerceProduct',
    localField: 'product_id',
    foreignField: '_id',
    justOne: true,
});


Schema.virtual('thumbnail', {
    ref: 'MediaFile',
    localField: 'thumbnail_id',
    foreignField: '_id',
    justOne: true,
});


export const EcommerceProductVariantModel = mongoose.model<MongooseEcommerceProductVariantSchema>('EcommerceProductVariant', Schema, 'ecommerce_variants');
