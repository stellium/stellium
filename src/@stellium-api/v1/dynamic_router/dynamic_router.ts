import * as express from 'express'
import {Router} from 'express'
import {getFunctionHandlerFromMethod} from "./route_compiler";
import {DynamicRoutes} from "./dynamic_routes";
import {assertRouteValid} from "./lib/assert_path";


export const DynamicApiRouter: Router = express.Router()


DynamicRoutes.forEach(_route => {

    if (_route.children) {

        _route.children.forEach(_childRoute => {
            const modelGroupRouter: Router = express.Router()

            const url = assertRouteValid(_route.route, _childRoute.route)

            _childRoute.methods.forEach(_method => {
                getFunctionHandlerFromMethod(url, modelGroupRouter, _method, _childRoute.model)
            })

            DynamicApiRouter.use(modelGroupRouter)
        })
    }
})
