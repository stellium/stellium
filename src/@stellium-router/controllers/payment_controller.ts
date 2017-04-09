import {
    Request,
    Response,
    NextFunction
} from 'express'
import {CommonRenderer} from '../../@stellium-renderer'
import {EcommerceOrderModel, EcommerceCartModel} from '../../@stellium-database'
import {Monolog} from '../../@stellium-common'


export const PaymentController = (req: Request,
                                  res: Response,
                                  next: NextFunction) => {

    let paymentMethod = req.query['payment_method'] || 'bank_transfer',
        sessionId = req['session'].id;

    EcommerceCartModel
    .find({session_id: sessionId})
    .populate({
        path: 'variant',
        populate: {
            path: 'product'
        }
    })
    .exec((err, cartItems) => {

        if (err) {
            res.sendStatus(500);
            Monolog({
                message: 'Error retrieving cart items in post checkout',
                error: err
            });
            return;
        }

        let purchases = [],
            // Reduce total cart price / value
            cartTotal = cartItems.reduce((sum, current) => sum + (current.quantity * current.variant.pricing.price), 0);

        cartItems.forEach(_item => purchases.push(
            {
                // Store variant id for referencing to the product's variant. Any product should at least have a variant
                // so this is required
                variant_id: _item.variant_id,
                // Track order quantity for the purchase
                quantity: _item.quantity,
                // As prices may change, we should store the value of the product at the time the user makes the payment
                priced_at: _item.variant.pricing.price
            }
        ));

        // Create order object and store in DB
        EcommerceOrderModel.create({
            purchases: purchases,
            total: cartTotal,
            status: 'placed'
        }, err => {

            if (err) {
                res.sendStatus(500);
                Monolog({
                    message: 'Error creating order document',
                    error: err
                });
                return;
            }

            let pageDate = {
                navDark: true,
                page: {
                    navDark: true,
                    modules: [{template: 'post-payment'}]
                }
            };

            /**
             * TODO(production): re-enable email notification
             * @date - 13 Feb 2017
             * @time - 12:04 AM
             */
            // Send email notification to buyer
            // OrderMailer(req, res, cartItems);
            // Render order success page
            CommonRenderer(req, res, pageDate);
            // Clear items from cart as they have been moved to the orders collection
            EcommerceCartModel.remove({session_id: sessionId})
        });
    });
};
