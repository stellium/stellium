import {SystemSettingsModel} from "../../@stellium-database"
import {SystemSettingsSchema} from "../schemas/system_settings"
import {SettingsKeys} from "../keys/settings";


const getSettingsValueByKey = (key: string, settings: SystemSettingsSchema[]) => {

    const set = settings['find'](_set => _set.key === key)

    return set && set.value
}


export const ResolveMailConfiguration = (cb: (err: any, config?: any) => void): void => {

    SystemSettingsModel.find({}, (err, settings) => {

        const config = {
            host: getSettingsValueByKey(SettingsKeys.SMTPHost, settings),
            port: getSettingsValueByKey(SettingsKeys.SMTPPort, settings),
            secure: getSettingsValueByKey(SettingsKeys.SMTPSsl, settings),
            auth: {
                user: getSettingsValueByKey(SettingsKeys.SMTPAuthUser, settings),
                pass: getSettingsValueByKey(SettingsKeys.SMTPAuthPassword, settings),
            }
        }

        cb(err, config)
    })
}