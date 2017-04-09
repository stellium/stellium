import {getModelCollection} from './methods/index_collection'
import {Router} from 'express'
import {
    Model,
    Document
} from 'mongoose'
import {assertRouteValid} from './lib/assert_path'
import {getModelDocument} from './methods/get_model'
import {createModelDocument} from './methods/create_model'
import {updateModelDocument} from './methods/update_model'
import {DynamicRouteMethod} from './dynamic_routes'


export interface QueryConfig {
    query?: any
    filter?: (...input: any[]) => any
    hook?: (...input: any[]) => any
}


export const getFunctionHandlerFromMethod = (route: string,
                                             router: Router,
                                             method: DynamicRouteMethod,
                                             model: Model<Document>): void => {

    let routeWithId = assertRouteValid(route, ':modelId')

    const queryConfig: QueryConfig = {
        query: method.query,
        filter: method.filter,
        hook: method.hook
    }

    switch (method.method) {
        case 'index':
            // Returns a document collection
            router.get(route, getModelCollection(model, queryConfig))
            break
        case 'get':
            // Returns a document based on it's document id
            router.get(routeWithId, getModelDocument(model, queryConfig))
            break
        case 'create':
            router.post(route, createModelDocument(model, queryConfig))
            break
        case 'update':
            router.put(routeWithId, updateModelDocument(model, queryConfig))
            break
    }
}
