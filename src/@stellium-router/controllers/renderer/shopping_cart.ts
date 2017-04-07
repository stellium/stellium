import {EcommerceCartModel} from "../../../@stellium-database";
import {EcommerceCartSchema} from "../../../@stellium-common";


export const getShoppingCartContent = (sessionId: string,
                                       cb: (err: any, items?: EcommerceCartSchema[]) => void): void => {

    EcommerceCartModel
    .find({session_id: sessionId})
    .populate({
        path: 'variant',
        populate: [
            {
                path: 'product'
            },
            {
                path: 'thumbnail'
            }
        ]
    })
    .exec((err, items) => cb(err, items));
};