import * as express from 'express'
import {Router} from 'express'
import {BasicWeatherController} from './basic'


export const WeatherRouter: Router = express.Router()

WeatherRouter.get('/basic', BasicWeatherController)
