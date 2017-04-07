const ua = require('universal-analytics')
import {CacheKeys, SystemSettingsSchema, SettingsKeys} from '../../@stellium-common'


export const AnalyticsMiddleware = (req, res, next) => {

    // Retrieve the system settings stored in the request
    const settings: SystemSettingsSchema[] = req.app.get(CacheKeys.SettingsKey)

    const GATrackingId = settings.find(_setting => _setting.key === SettingsKeys.AnalyticsTrackingID).value;

    // Attach the unique visitor to the request instance for later retrieval
    req.app.set(CacheKeys.UAVisitor, ua(GATrackingId, req.session.id))

    next()
}
