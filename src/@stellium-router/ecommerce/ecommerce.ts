import * as async from 'async'
import * as express from 'express'
import {Router} from 'express'
import {
    ReservedPageKeys,
    URLTranslator,
    LanguageKeys,
    Monolog
} from '../../@stellium-common'
import {EcommerceCartModel, EcommerceProductModel, EcommerceProductVariantModel} from '../../@stellium-database'

import {ProductsRenderer} from '../controllers/products_renderer'
import {ProductDetailRenderer} from '../controllers/products_detail_renderer'
import {ShoppingCartController} from '../controllers/shopping_cart_controller'
import {PaymentController} from '../controllers/payment_controller'
import {CheckOutController} from '../controllers/checkout_controller'


/**
 * TODO(remove): remove when file is included
 * @date - 06 Apr 2017
 * @time - 2:57 PM
 */
const DEVELOPMENT = true


export const EcommerceRouter: Router = express.Router();


let reservedURLs = URLTranslator('en');
EcommerceRouter.use((req, res, next) => {
    let currentLanguage = req.app.get(LanguageKeys.CurrentLanguage);
    reservedURLs = URLTranslator(currentLanguage);
    next();
});


const FakeCart = (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const emptyShoppingCart = (cb) => EcommerceCartModel.remove({}, err => cb(err));

    const getProductsAndSave = (cb) => {

        const getRandomProducts = (cb) => {
            EcommerceProductVariantModel
            .find({'pricing.price': {$gte: 50000}})
            .skip(Math.floor(Math.random() * 12))
            .limit(3)
            .exec((err, items) => cb(err, items));
        };

        const saveItemToCart = (item, cb) => {
            EcommerceCartModel.create({
                session_id: req['session'].id,
                quantity: Math.floor(Math.random() * 5) + 1,
                variant_id: item._id
            }, err => cb(err));
        };

        const saveToCartDb = (items, cb) => async.map(items, saveItemToCart, err => cb(err));

        async.waterfall([
            getRandomProducts,
            saveToCartDb
        ], err => cb(err));
    };

    async.series([
        emptyShoppingCart,
        getProductsAndSave,
    ], err => next(err));
};

// Grabs 3 random products and puts them into the visitors cart, for development only
if (DEVELOPMENT) EcommerceRouter.use(FakeCart);


// Page to display all items that has been added to the shopping cart by the user
EcommerceRouter.get(
    `/${reservedURLs(ReservedPageKeys.ShoppingCart)}`,
    ShoppingCartController
);


// When the user has successfully made a payment
EcommerceRouter.get(
    `/${reservedURLs(ReservedPageKeys.PostOrder)}`,
    PaymentController
);


// Page where user has to fill shipping, billing and payment information before proceeding to the final
// payments page
EcommerceRouter.get(
    `/${reservedURLs(ReservedPageKeys.Checkout)}`,
    CheckOutController
);


// Payment has completed and this page is only to show the user that the payment was successful
EcommerceRouter.get(
    `/${reservedURLs(ReservedPageKeys.CheckoutComplete)}`,
    PaymentController
);


/**
 * Lightweight fallback controller when users disable JavaScript in their browser
 * When AJAX requests are not possible because JS is disabled in browser, we need to provide some fallback method
 * for visitors to still be able to add products to cart. Register their cart action here and redirect them
 * to the cart overview page
 *
 * GET /add-to-cart/someProductId
 * Register the variant ID to be added to the cart, do basic checks like inventory tracking and redirect
 * them to the cart page
 *
 * Redirects to /cart
 */
EcommerceRouter.get(`/${reservedURLs(ReservedPageKeys.AddToCart)}`, () => {});


// Queries all products in DB
EcommerceRouter.get(`/${reservedURLs(ReservedPageKeys.Products)}`, ProductsRenderer);


// Required by page editor
// We inject a random product into the product-detail page so we can preview the page
// correctly from within the iFrame page editor
EcommerceRouter.get(`/${reservedURLs(ReservedPageKeys.ProductDetail)}`, (req, res, next) => {
    EcommerceProductModel['random']((err, product) => {
        if (err) {
            res.sendStatus(500);
            Monolog({
                message: 'Error retrieving fake product for page editor',
                error: err
            });
            return
        }
        req.url = `/${reservedURLs(ReservedPageKeys.ProductDetail)}/${product.url['en']}`;
        next();
    });
});
// Get product detail view
EcommerceRouter.get(`/${reservedURLs(ReservedPageKeys.ProductDetail)}/:productUrl`, ProductDetailRenderer);
EcommerceRouter.get(`/${reservedURLs(ReservedPageKeys.ProductDetail)}/:productUrl/:variantId`, ProductDetailRenderer);
