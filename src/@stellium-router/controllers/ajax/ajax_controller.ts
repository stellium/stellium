import * as express from 'express'
import * as bodyParse from 'body-parser'
import {Router} from 'express'
import {ShoppingCartRouter} from './shopping_cart_router'
import {ContactRouter} from "./contact_handlers/index";


export const AjaxController: Router = express.Router()

AjaxController.use(bodyParse.json())

AjaxController.use(bodyParse.urlencoded({
    extended: true
}))

AjaxController.use('/ecommerce', ShoppingCartRouter)

AjaxController.use('/contact', ContactRouter)
