import * as request from 'request'
import {MonologModel} from './model'
import {ENV} from '../development/environment_variable'

export const sendPushNotification = (message: string, monologEntryId: string) => {

    if (typeof message !== 'string') {

        message = JSON.stringify(message)
    }

    request.post(`https://api.pushover.net/1/messages.json`, {
        form: {
            token: 'apwmscqq8sz67hy3jc8uyurc6uq1a7',
            user: 'umkmpemhynmcfe9t4yqjyf317474hy',
            title: 'Monolog Severe Error',
            url: `http://${ENV.stellium_domain}/stellium/expecto_patronum/${monologEntryId}`,
            message: message
        }
    }, err => {

        if (err) {
            if (LOG_ERRORS) console.log('Request to PushOver error', err)
            return
        }

        MonologModel.findByIdAndUpdate(monologEntryId, {status: 'transported'})
    })
}
