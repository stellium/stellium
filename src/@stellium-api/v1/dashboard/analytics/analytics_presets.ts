import {CountrySessionsPipe} from './data_pipes/country_sessions'
export const AnalyticsPresets = [
    {
        key: 'country_sessions',
        options: {
            metrics: 'ga:sessions',
            dimensions: 'ga:country',
            sort: '-ga:sessions',
            'max-results': 8
        },
        modifier: CountrySessionsPipe
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
