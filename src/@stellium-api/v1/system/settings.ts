import * as async from 'async'
import * as express from 'express'
import {Request, Router} from 'express'
import {SystemSettingsSchema, Monolog} from '../../../@stellium-common'
import {SystemSettingsModel} from '../../../@stellium-database'
import {ClearCacheValueByRequest} from '../resource_cache'


export const SystemSettingsRouter: Router = express.Router()


const filterSettingsForUser = (collection: any[], roleId: number, cb: (err, settings) => void): void => {

    const authRole = roleId

    const filteredSettings = collection.filter(_set => {

        // Master Admin can see all system settings
        if (authRole === 0) return true

        return (_set.allowed_roles.includes(roleId) || roleId <= 1)
    })

    cb(null, filteredSettings)
}


const groupSettings = (settings) => {

    const keySettings = {}

    settings.forEach(_settings => {

        if (keySettings[_settings.settings_group]) {

            keySettings[_settings.settings_group] = [].concat(keySettings[_settings.settings_group], _settings)

        } else {

            keySettings[_settings.settings_group] = [_settings]
        }
    })

    let ordered = []

    for (let key in keySettings) {

        let settingsGroup = {
            title: keySettings[key][0].settings_group.replace(/_/g, ' '),
            settings: []
        }

        if (keySettings.hasOwnProperty(key)) {

            keySettings[key].forEach(_settings => {

                settingsGroup.settings = [].concat(settingsGroup.settings, _settings)
            })
        }

        ordered = [].concat(ordered, settingsGroup)
    }

    return ordered
}


SystemSettingsRouter.get('/', (req, res) => {

    SystemSettingsModel.find({}, (err, settings) => {

        filterSettingsForUser(settings, req.user.role_id, (err, settings) => {

            res.send(groupSettings(settings))
        })
    })
})


const saveSettingItem = (req: Request) => (settings: SystemSettingsSchema, cb: (err: any) => void): void => {

    const authUser = req.user

    const authRole = authUser.role_id

    if (settings.locked && authRole !== 0) {
        cb(null)
        return
    }

    SystemSettingsModel.findById(settings._id, (err, _settings) => {

        // Only allow master administrators to alter locked settings fields
        if (_settings.locked && authRole !== 0) {
            cb(null)
            return
        }

        // Only allow the user to alter settings within their role scope
        if (_settings.allowed_roles.includes(authRole) || authRole <= 1) {

            _settings.update({value: settings.value}, err => cb(err))

        } else {

            cb(null)
        }
    })
}


SystemSettingsRouter.put('/', (req, res) => {

    const settingsCollection: SystemSettingsSchema[] = req.body

    async.map(settingsCollection, saveSettingItem(req), err => {

        if (err) {
            res.status(500).send('Internal Server Error')
            Monolog({
                message: 'Error while attempting to save settings',
                error: err
            })
            return
        }

        res.send({message: 'Settings have been saved successfully'})

        ClearCacheValueByRequest(req, ['website'])
    })
})
