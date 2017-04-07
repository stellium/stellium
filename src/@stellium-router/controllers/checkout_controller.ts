import * as express from 'express';
import {CommonRenderer} from "../../@stellium-renderer";


export const CheckOutController = (req: express.Request,
                                   res: express.Response,
                                   next: express.NextFunction) => {

    let pageData = {
        page: {
            modules: [{template: 'checkout'}]
        }
    };

    CommonRenderer(req, res, pageData);
};
