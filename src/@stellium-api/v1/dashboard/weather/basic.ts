import * as fs from 'fs'
import * as path from 'path'
import * as redis from 'redis'
import * as request from 'request'
import * as geoip from 'geoip-lite'
import {ENV, Monolog} from '../../../../@stellium-common'

// req.headers['x-real-ip'] || req.connection.remoteAddress
const redisClient = redis.createClient({db: ENV.redis_index})

const weatherCacheKeyPrefix = '_mt_weather_cache_'

export const BasicWeatherController = (req, res) => {

    /**
     * TODO(production): Change to real IP, 127.* won't work in local development
     * @date - 4/15/17
     * @time - 3:55 PM
     */
    const ip = '101.128.67.169' // req.headers['x-real-ip'] || req.connection.remoteAddress

    const geo = geoip.lookup(ip)

    console.log('geo', geo)

    const cacheKey = weatherCacheKeyPrefix + geo.city

    redisClient.get(cacheKey, (err, result) => {

        if (err) {
            Monolog({
                message: 'Error retrieving cache weather data for ' + geo.city,
                error: err
            })
            res.sendStatus(500)
            return
        }

        if (result) {
            res.send(result)
            return
        }

        // http://api.openweathermap.org/data/2.5/weather?q=London,uk&appid=67f701116a00383faf97fe75bad17752
        fs.readFile(path.resolve(StelliumRootPath, '../../keys/open_weather.json'), {encoding: 'utf8'}, (err, file) => {

            if (err) {
                Monolog({
                    message: 'Error reading open weather API key to retrieve basic weather data',
                    error: err
                })
                res.sendStatus(500)
                return
            }

            const fileAsObject = JSON.parse(file)

            const apiKey = fileAsObject.api_key

            request(`http://api.openweathermap.org/data/2.5/weather?q=${geo.city}&appid=${apiKey}`, (error, response, body) => {
                console.log('error', error)
                console.log('response', response)
                console.log('body', body)
            })
        })
    })
}
