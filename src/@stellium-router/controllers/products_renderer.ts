import * as async from 'async';
import * as express from 'express';
import {CommonRenderer} from "../../@stellium-renderer";
import {EcommerceProductModel} from "../../@stellium-database";
import {
    Monolog,
    EcommerceProductSchema
} from "../../@stellium-common";


const CountTotalProducts = (callback: (err: any, count: number) => void): void => {

    EcommerceProductModel.find().count((err, count) => callback(err, count));
};


const GetPaginatedProducts = (itemsPerPage: number,
                              _page: number,
                              cb: (err: any, products?: EcommerceProductSchema[]) => void): void => {

    EcommerceProductModel.find({deleted_at: null})
    .skip(itemsPerPage * --_page)
    .limit(itemsPerPage)
    // .populate('gallery')
    .populate({
        path: 'variants',
        populate: {
            path: 'thumbnail'
        }
    })
    .exec((err, products) => {

        if (err) {
            Monolog({
                message: 'Error populating products',
                error: err
            });
            cb(err);
            return;
        }
        cb(err, products);
    });
};


export const ProductsRenderer = (req: express.Request, res: express.Response, next: express.NextFunction) => {

    let itemsPerPage = +req.query['limit'] || 12,
        _page = +req.query['page'] || 1;

    async.parallel([
        // Count total number of products in DB
        CountTotalProducts,
        // Query products based on page index and number of items to fit on a single page
        async.apply(GetPaginatedProducts, itemsPerPage, _page),
    ], (err, result) => {

        if (err) {
            Monolog({
                message: 'Error executing async operation',
                error: err
            });
            res.sendStatus(500);
            return;
        }

        const pageData = {
            products: result[1],
            productsTotal: result[0],
            pageIndex: _page,
            itemsPerPage: itemsPerPage,
            productPages: result[0] / itemsPerPage,
            indexStart: (itemsPerPage * (_page - 1)) + 1,
            indexEnd: _page * itemsPerPage,
            page: {
                title: {
                    en: 'Products'
                },
                meta: {
                    en: 'Products'
                },
                modules: [
                    {
                        template: 'pages/products',
                        database_resolver: {
                            model: 'EcommerceProducts',
                            populate: 'all',
                            paginate: true
                        }
                    }
                ]
            }
        };

        CommonRenderer(req, res, pageData);
    });
};

