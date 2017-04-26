// import * as csurf from 'csurf'
import * as express from 'express'
import * as bodyParser from 'body-parser'
// import * as cookieParser from 'cookie-parser'
import {Router} from 'express'
import {ShoppingCartRouter} from './shopping_cart_router'
import {ContactRouter} from './contact_handlers/index'


// const csrfMiddleware = csurf({cookie: true})

export const AjaxController: Router = express.Router()

AjaxController.use(bodyParser.json())

AjaxController.use(bodyParser.urlencoded({
    extended: true
}))


/**
 * TODO(security): Re-introduce csrf guard
 * @date - 4/23/17
 * @time - 11:58 AM
 */
// AjaxController.use(csrfMiddleware)

// AjaxController.use(cookieParser())

AjaxController.use('/ecommerce', ShoppingCartRouter)

AjaxController.use('/contact', ContactRouter)
