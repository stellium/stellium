import * as express from 'express'
import {Router} from 'express'
import {BasicContactHandler} from './basic_handler'
import {ReservationRouter} from '../reservation_handler'


export const ContactRouter: Router = express.Router()

ContactRouter.post('/basic', BasicContactHandler)

ContactRouter.post('/reservation', ReservationRouter)
