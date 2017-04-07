import * as express from 'express';
import {CommonRenderer} from "../../@stellium-renderer";

export const ShoppingCartController = (req: express.Request,
                                       res: express.Response,
                                       next: express.NextFunction) => {

    let pageData = {
        page: {
            modules: [{template: 'shopping-cart'}]
        }
    };

    CommonRenderer(req, res, pageData);
};
