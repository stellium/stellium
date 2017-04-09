import * as async from 'async'
import {SeedConsole, FindOneUser, readSeederFile} from "./_lib"
import {SystemLanguageModel} from "../models/system_language"
import {SystemSettingsModel} from '../models/system_settings'


const removeData = (cb: (err: any) => void): void => {
    const removeLanguages = (cb: (err: any) => void) => SystemLanguageModel.remove({}, err => cb(err))
    const removeSettings = (cb: (err: any) => void) => SystemSettingsModel.remove({}, err => cb(err))

    async.parallel([
        removeLanguages,
        removeSettings,
    ], err => cb(err))
}


const seedDefaultLanguage = (user, cb): void => {
    SystemLanguageModel.create({
        title: 'English',
        code: 'en',
        'default': true,
        user_id: user._id,
        status: true
    }, err => cb(err))
}


const seedLanguage = (cb: (err: any) => void): void => {
    async.waterfall([
        FindOneUser,
        seedDefaultLanguage
    ], err => cb(err))
}


const seedSettings = (cb: (err: any) => void): void => {

    const saveSetting = (setting, _cb) => SystemSettingsModel.create(setting, err => _cb(err))

    readSeederFile('settings', (err, settings) => {
        const orderedSettings = settings.map((_set, index) => {
            _set.order = index + 1
            return _set
        })
        async.map(orderedSettings, saveSetting, err => cb(err))
    })
}


export const SettingsSeeder = (cb: (err: any) => void): void => {
    SeedConsole("Seeding Settings")
    async.series([
        removeData,
        seedLanguage,
        seedSettings
    ], err => cb(err))
}
