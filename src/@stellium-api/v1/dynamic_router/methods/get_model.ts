import {
    Model,
    Document
} from 'mongoose'
import {
    NextFunction,
    Request,
    Response,
    RequestHandler
} from 'express'
import {Monolog} from '../../../../@stellium-common'
import {CacheQueryResult} from '../../resource_cache'
import {QueryConfig} from '../route_compiler'


export function getModelDocument(model: Model<Document>, config?: QueryConfig): RequestHandler {

    return function(req: Request, res: Response, next: NextFunction): void {

        let query = {
            _id: req.params.modelId
        }

        if (req.user.role_id === 0 || (req.query && req.query['include_deleted'])) query['deleted_at'] = null;

        let _modelConstructor = model.findOne(query)

        let populateQuery = req.query && req.query.populate;

        if (populateQuery) {

            let splitByComma = populateQuery.split(',')

            _modelConstructor = _modelConstructor.populate(splitByComma.join(' '))
        }

        _modelConstructor
        .exec((err, document) => {

            if (!document) {
                next()
                return
            }

            if (err) {
                res.sendStatus(500)
                Monolog({
                    message: 'Failed to index collection',
                    error: err
                })
                return
            }

            if (config.filter) {

                config.filter(document, req, res)

            } else {

                res.send(document)
            }

            // Cache query result to redis
            CacheQueryResult(req, document)
        })
    }
}