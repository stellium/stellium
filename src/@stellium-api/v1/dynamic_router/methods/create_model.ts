import {Response, Request, RequestHandler} from "express";
import {Model, Document} from "mongoose";
import {Monolog} from "../../../../@stellium-common";
import {ClearCacheValueByRequest} from "../../resource_cache";
import {QueryConfig} from "../route_compiler";


export function createModelDocument(model: Model<Document>,
                                    config?: QueryConfig): RequestHandler {

    return function (req: Request, res: Response): void {

        model.create(req.body, (err, document) => {

            if (err) {
                res.sendStatus(500)
                Monolog({
                    message: 'Error storing new document',
                    error: err
                })
                return
            }

            res.send({
                message: 'Created successfully',
                data: document
            })

            ClearCacheValueByRequest(req)
        })
    }
}