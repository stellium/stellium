import * as mongoose from 'mongoose';
import {EcommerceProductSchema} from "../../@stellium-common";


export interface MongooseEcommerceProductSchema extends EcommerceProductSchema, mongoose.Document {
    _id: any;
    random: (err: any, product: EcommerceProductSchema) => void;
}


const Schema = new mongoose.Schema({
    title: mongoose.Schema.Types.Mixed,
    url: mongoose.Schema.Types.Mixed,
    meta: mongoose.Schema.Types.Mixed,
    description: mongoose.Schema.Types.Mixed,
    tags: [String],
    gallery_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MediaFile'
    }],
    variant_options: {
        key: String,
        label: mongoose.Schema.Types.Mixed,
        values: [String]
    },
    collection_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EcommerceProductCollection'
    }],
    type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EcommerceProductType'
    },
    visibility: {
        countries: {
            include: [String],
            exclude: [String]
        },
        languages: {
            include: [String],
            exclude: [String]
        },
        sales_channel_ids: [mongoose.Schema.Types.ObjectId]
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    },
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
        virtuals: true
    }
});

Schema.virtual('variants', {
    ref: 'EcommerceProductVariant',
    localField: '_id',
    foreignField: 'product_id'
});

Schema.virtual('gallery', {
    ref: 'MediaFile',
    localField: 'gallery_ids',
    foreignField: '_id'
});

Schema.virtual('_collection', {
    ref: 'EcommerceProductCollection',
    localField: 'collection_id',
    foreignField: '_id',
    justOne: true,
});

Schema.virtual('type', {
    ref: 'EcommerceProductType',
    localField: 'type_id',
    foreignField: '_id',
    justOne: true,
});

Schema.virtual('user', {
    ref: 'SystemUser',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true
});

Schema.statics.random = function (callback) {
    this.count(function (err, count) {
        if (err) {
            return callback(err);
        }
        let rand = Math.floor(Math.random() * count);
        this.findOne().skip(rand).exec(callback);
    }.bind(this));
};

export const EcommerceProductModel = mongoose.model<MongooseEcommerceProductSchema>('EcommerceProduct', Schema, 'ecommerce_products');
