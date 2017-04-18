import * as path from 'path'
import * as async from 'async'
import * as google from 'googleapis'
import {CacheQueryResult} from '../../resource_cache'
import {AnalyticsPresets} from './analytics_presets'
import {
    StoragePath,
    Monolog,
    getSettingsByKey,
    SettingsKeys,
    CacheKeys
} from '../../../../@stellium-common'
import {SocketService} from '../../../../@stellium-socket/socket_service'


const analytics = google.analytics('v3')

const key = require(path.resolve(StoragePath, 'secure', 'google_api.json'))

const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/analytics.readonly'],
    null
)


const getAnalyticsData = (viewId: string) => (input, cb: (err: any, data?: any) => void): void => {

    const baseOptions = {
        auth: jwtClient,
        ids: `ga:${viewId}`,
        'start-date': '30daysAgo',
        'end-date': 'today',
    }

    const option = {...baseOptions, ...input.options}

    analytics.data.ga.get(option, (err, data) => {

        const result = {
            key: input.key,
            data: data
        }

        if (input.modifier) input.modifier(result)

        cb(err, result)
    })
}


export const GoogleAnalyticsController = (req, res) => {

    // token is valid for 1 hour
    // jwtClient.authorize((err, tokens) => {
    jwtClient.authorize(err => {

        if (err) {
            res.status(500).send()
            Monolog({
                message: 'Failed authenticating with Google API for Analytics data',
                error: err
            })
            return
        }

        const analyticsViewID = getSettingsByKey(SettingsKeys.AnalyticsViewID, req.app.get(CacheKeys.SettingsKey), true)

        async.map(AnalyticsPresets, getAnalyticsData(analyticsViewID), (err, data) => {

            if (err) {

                if (err.code === 403) {
                    res.status(422).send({
                        message: 'No analytics account set up, please contact your developer for assistance.'
                    })
                    return
                }

                res.status(500).send()
                Monolog({
                    message: 'Error while fetching analytics data',
                    error: err
                })
                return
            }

            res.send(data)

            // Cache analytics result to redis
            CacheQueryResult(req, data)
        })
    })
}
