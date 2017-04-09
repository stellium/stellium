import {
    Model,
    Document
} from 'mongoose'
import {
    Request,
    RequestHandler,
    Response
} from 'express'
import {Monolog, SystemUserSchema} from '../../../../@stellium-common'
import {CacheQueryResult} from "../../resource_cache"
import {QueryConfig} from '../route_compiler'


export interface ExtendedDocument extends Document {
    user?: SystemUserSchema;
}


export function getModelCollection(model: Model<ExtendedDocument>,
                                   config?: QueryConfig): RequestHandler {

    return function (req: Request, res: Response): void {

        let sortQuery = {deleted_at: 1, updated_at: -1, order: -1}

        if (config && config.query) sortQuery = config.query.sort

        // Model info
        if (DEVELOPMENT) console.log('model.name', model.modelName)
        if (DEVELOPMENT) console.log('sortQuery', sortQuery)

        let baseQuery: any = {deleted_at: null}

        if (req.user.role_id === 0) {
            baseQuery = {}
        }

        model.find(baseQuery)
        .populate('user')
        .sort(sortQuery)
        .lean()
        .exec((err, collection) => {

            if (err) {
                res.sendStatus(500)
                Monolog({
                    message: 'Failed to index collection',
                    error: err
                })
                return
            }

            if (config.filter) {

                config.filter(collection, req, res)

            } else {

                res.send(collection)

                // Cache query result to redis
                CacheQueryResult(req, collection)
            }

            if (config.hook) config.hook()
        })
    }
}