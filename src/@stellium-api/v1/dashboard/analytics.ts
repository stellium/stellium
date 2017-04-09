import * as path from 'path'
import * as async from 'async'
import * as express from 'express'
import * as google from 'googleapis'
import {Router} from 'express'
import {StoragePath, Monolog} from '../../../@stellium-common'
import {CacheQueryResult} from '../resource_cache'
import {getSettingsByKey} from '../../../@stellium-common'
import {CacheKeys} from '../../../@stellium-common'
import {SettingsKeys} from '../../../@stellium-common'

const analytics = google.analytics('v3')


const key = require(path.resolve(StoragePath, 'secure', 'google_api.json'))


export const AnalyticsRouter: Router = express.Router()


const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/analytics.readonly'],
    null
)


const bundles = [
    {
        key: 'country_sessions',
        options: {
            metrics: 'ga:sessions',
            dimensions: 'ga:country',
            sort: '-ga:sessions',
            'max-results': 8
        }
    },
    {
        key: 'country_users',
        options: {
            metrics: 'ga:sessions',
            dimensions: 'ga:userType,ga:country',
            sort: '-ga:sessions'
        }
    },
    {
        key: 'traffic_source',
        options: {
            metrics: 'ga:sessions,ga:newUsers,ga:bounceRate,ga:pageviewsPerSession',
            dimensions: 'ga:medium',
            sort: '-ga:sessions'
        }
    },
    {
        key: 'device_category',
        options: {
            metrics: 'ga:pageViews',
            dimensions: 'ga:deviceCategory,ga:date',
            sort: 'ga:date'
        }
    },
    {
        key: 'device_total',
        options: {
            metrics: 'ga:sessions',
            dimensions: 'ga:deviceCategory',
            sort: '-ga:sessions'
        }
    }
]


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

        cb(err, result)
    })
}


AnalyticsRouter.get('/', (req, res) => {

    // token is valid for 1 hour
    jwtClient.authorize(function (err, tokens) {

        if (err) {
            res.status(500).send()
            Monolog({
                message: 'Failed authenticating with Google API for Analaytics data',
                error: err
            })
            return
        }

        const analyticsViewID = getSettingsByKey(SettingsKeys.AnalyticsViewID, req.app.get(CacheKeys.SettingsKey), true)

        async.map(bundles, getAnalyticsData(analyticsViewID), (err, data) => {

            if (err) {
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
})
