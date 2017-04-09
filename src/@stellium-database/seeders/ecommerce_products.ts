import * as async from 'async'
import {SeedConsole, readSeederFile} from './_lib'
import {EcommerceProductModel} from '../models/ecommerce_product'
import {EcommerceProductVariantModel} from '../models/ecommerce_product_variant'
import {SystemUserModel} from '../models/system_user'
import {MediaFileModel} from '../models/media_file'
import {Monolog} from '../../@stellium-common'


const removeProducts = (cb: (err: any) => void): void => {
    EcommerceProductModel.remove({}, err => cb(err))
};


const removeVariants = (cb: (err: any) => void): void => {
    EcommerceProductVariantModel.remove({}, err => cb(err));
};


const seedProducts = (cb: (err: any) => void): void => {

    SystemUserModel.findOne({email: 'boris@fleava.com'}, (err, user) => {

        readSeederFile('products', (err, products) => {

            let i = 0;
            products.forEach(product => {

                MediaFileModel.random((err, file) => {

                    if (err) {
                        Monolog({
                            message: 'Error retrieving media object',
                            error: err
                        });
                        return cb(err);
                    }

                    product['gallery_ids'] = [file._id];

                    EcommerceProductModel.create(product, (err, newProduct) => {

                        if (err) {
                            Monolog({
                                message: 'Error creating product object',
                                error: err,
                            });
                            return cb(err);
                        }

                        product.variants.forEach(variant => {

                            variant['user_id'] = user._id;
                            variant['thumbnail_id'] = file._id;
                            variant['product_id'] = newProduct['_id'];

                            EcommerceProductVariantModel.create(variant, err => {

                                if (err) return cb(err);
                                if (++i >= products.length) cb(err);
                            });
                        });
                    });
                });
            });

        });
    });
};


export const ProductsSeeder = (cb: (err: any) => void): void => {
    SeedConsole("Seeding Products");
    async.series([
        removeProducts,
        removeVariants,
        seedProducts
    ], err => cb(err));
};
