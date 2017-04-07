import * as async from 'async'
import * as express from 'express'
import {Router} from 'express'
import {
    EcommerceCartModel,
    EcommerceProductVariantModel
} from '../../../@stellium-database'
import {
    Monolog,
    EcommerceCartSchema
} from '../../../@stellium-common'


export const ShoppingCartRouter: Router = express.Router()


const CreateOrUpdate = (sessionId: string,
                        variantId: string,
                        quantity: number,
                        cb: (err: any, cart?: EcommerceCartSchema) => void): void => {

    EcommerceCartModel
    .findOne({session_id: sessionId, variant_id: variantId})
    .exec((err, cartItem) => {

        if (cartItem) {
            // If item already exists, update it's quantity
            cartItem.update({$inc: {quantity: quantity}, updated_at: new Date})
            .exec(err => cb(err, cartItem))

        } else {
            // Create new entry
            EcommerceCartModel.create({
                quantity: quantity,
                variant_id: variantId,
                /**
                 * TODO(boris): Check if sessionId is authenticated with customer account
                 * @date - 11 Feb 2017
                 * @time - 11:11 PM
                 */
                session_id: sessionId,
            }, err => cb(err))
        }
    })
}


const DecreaseVariantStock = (variantId: string,
                              quantity: number,
                              cb: (err?: any) => void): void => {

    EcommerceProductVariantModel
    .findById(variantId)
    .exec((err, variant) => {

        if (err) {
            cb(err)
            return
        }

        // If variant does not have inventory tracking enabled, move on
        if (!variant.track_inventory) {

            cb(null)
            return
        }

        // Check if inventory tracking enabled for the variant
        variant
        // Decrease variant stock if inventory tracking is enabled
        .update({$inc: {quantity: -quantity}, updated_at: new Date})
        .exec(err => cb(err));
    })
}


/**
 * Add items to the cart DB
 * POST: /ajax/ecommerce/cart/add
 * payload: {
 *     product_id: "someProductId",
 *     quantity: 3
 * }
 */
ShoppingCartRouter.post('/cart/add', (req, res) => {

    let quantity = +req.body['quantity']

    let variantId = req.body['variantId']

    if (typeof quantity === 'undefined' || typeof variantId === 'undefined') {
        res.status(409).send('Incomplete fields. `quantity` and `variantId` are required')
        return
    }

    async.parallel([
        async.apply(CreateOrUpdate, req['session'].id, variantId, quantity),
        async.apply(DecreaseVariantStock, variantId, quantity)
    ], err => {

        if (err) {
            res.sendStatus(500)
            Monolog({
                message: 'Error in adding cart item',
                error: err
            })
            return
        }

        res.send()
    })
})


ShoppingCartRouter.delete('/cart/remove/:cartId', (req, res, next) => {

    EcommerceCartModel
    .remove({_id: req.params['cartId']}, err => {

        // rfdsfdsfdsafsdf
        if (err) {
            res.sendStatus(500)
            Monolog({
                message: 'Error deleting item from cart',
                error: err,
            })
            return
        }

        EcommerceCartModel
        .find({session_id: req['session'].id})
        .populate('variant')
        .exec((err, items) => {

            if (err) {
                res.sendStatus(500)
                Monolog({
                    message: 'Error retrieving cart items after deleting item from cart',
                    error: err
                })
                return
            }

            let cartTotal = items.reduce((sum, current) => sum + (current.variant.pricing.price * current.quantity), 0)

            res.send({
                cart_items: items,
                cart_total: cartTotal
            })
        })
    })
})
