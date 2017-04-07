import {
    Model,
    Document
} from "mongoose";
import {
    Request,
    RequestHandler,
    Response
} from "express";
import {Monolog} from "../../../../@stellium-common";
import {ClearCacheValueByRequest} from "../../resource_cache";
import {QueryConfig} from "../route_compiler";


export function updateModelDocument(model: Model<Document>,
                                    config?: QueryConfig): RequestHandler {

    return function (req: Request, res: Response): void {

        let updatedModel = req.body

        updatedModel.updated_at = Date.now()

        model
        .findByIdAndUpdate(req.params.modelId, req.body)
        .exec((err) => {

            if (err) {
                res.sendStatus(500)
                Monolog({
                    message: 'Failed to update document',
                    error: err
                })
                return
            }

            res.send({message: 'Document has been updated successfully'})

            if (config.hook) config.hook(updatedModel)

            // Clear all resource cache as collection has changed
            ClearCacheValueByRequest(req)
        })
    }
}