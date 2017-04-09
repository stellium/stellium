import * as express from 'express'
import {ProductModel} from '../../../../../Database/Models/Ecommerce/Product'
import {Monolog} from '../../../../../Helpers/Monolog/index'


export const EcommerceProductsRouter = express.Router();


EcommerceProductsRouter.get('/', (req, res) => {

    ProductModel.find({}, (err, products) => {
        if (err) res.status(500).send('Error retrieving users');
        else res.send(products);
    });
});


EcommerceProductsRouter.get('/:productId', (req, res) => {

    ProductModel.findById(req.params['productId'], (err, product) => {
        res.send(product);
    });
});


EcommerceProductsRouter.post('/', (req, res) => {

    ProductModel.create(req.body, (err, product) => {
        if (err) return res.status(500).send('Error saving product to database');
        res.send({
            status: 'Product successfully create',
            data: product
        });
    });
});


EcommerceProductsRouter.patch('/:productId', (req, res) => {

    ProductModel.findById(req.params['productId'], (err, product) => {

        Object.assign(product, req.body);

        product.updated_at = new Date;

        product.save(err => {

            if (err) {

            }
        });
    });
});


EcommerceProductsRouter.delete('/:productId', (req, res) => {

    ProductModel.findById(req.params['productId'], (err, product) => {

        product.deleted_at = new Date;

        product.save(err => {

            if (err) {

                Monolog({
                    message: 'Error soft deleting product model',
                    error: err
                });

                res.status(500).send('Internal Server Error');

            } else res.send('Product has deleted!');
        });
    });
});
