import * as express from 'express'
import {CommonRenderer} from '../../@stellium-renderer'
import {EcommerceProductModel, MediaFileModel} from '../../@stellium-database'
import {
    LanguageKeys,
    Monolog,
    EcommerceProductSchema
} from '../../@stellium-common'


const getMinPrice = (variants: any[]): number => {
    let min = null;
    variants.forEach(_var => {
        if (!min) {
            min = _var.pricing.price;
            return;
        }
        if (_var.pricing.price < min) min = _var.pricing.price;
    });
    return min;
};


const getMaxPrice = (variants: any[]): number => {
    let max = null;
    variants.forEach(_var => {
        if (!max) {
            max = _var.pricing.price;
            return;
        }
        if (_var.pricing.price > max) max = _var.pricing.price;
    });
    return max;
};


export const ProductDetailRenderer = (req: express.Request, res: express.Response, next: express.NextFunction) => {

    let language = req.app.get(LanguageKeys.CurrentLanguage),
        productUrl = req.params['productUrl'],
        // Variant ID if provided
        variantId = req.params['variantId'];

    EcommerceProductModel
    .findOne({[`url.${language}`]: productUrl})
    .populate([
        {
            path: 'gallery'
        },
        {
            path: 'variants',
            populate: {
                path: 'thumbnail'
            }
        }
    ])
    .exec((err, rawProduct) => {

        if (err) {
            Monolog({
                message: 'Error retrieving product object',
                error: err
            });
            res.sendStatus(500);
            return;
        }

        if (!rawProduct) {
            next();
            return;
        }

        let mutableProduct = <EcommerceProductSchema>rawProduct.toObject();

        // mutableProduct['variants'] = variants;

        mutableProduct['prices'] = {
            min: getMinPrice(mutableProduct.variants),
            max: getMaxPrice(mutableProduct.variants),
        };

        MediaFileModel.find({"_id": {"$in": rawProduct.gallery}}, (err, images) => {

            if (err) {
                Monolog({
                    message: 'Error retrieving media files for product',
                    error: err
                });
                res.sendStatus(500);
                return;
            }

            mutableProduct.gallery = images;

            const pageData = {
                productRaw: rawProduct,
                product: mutableProduct,
                variantId: variantId,
                __META__: {
                    title: rawProduct.title[language],
                    meta: rawProduct.meta[language],
                    image: images[0].url
                },
                darkNav: true,
                /**
                 * TODO(production): Dynamize products template
                 * @date - 10 Feb 2017
                 * @time - 11:37 PM
                 */
                page: {
                    theme_variables: {
                        darkNav: true,
                    },
                    modules: [
                        {
                            template: 'pages/product-detail'
                        }
                    ]
                }
            };

            CommonRenderer(req, res, pageData);
        });
    });
};
