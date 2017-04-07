import * as async from 'async'
import * as express from 'express'
import {Request, Router} from 'express'
import {SystemSettingsSchema, Monolog} from '../../../@stellium-common'
import {SystemSettingsModel} from '../../../@stellium-database'
import {ClearCacheValueByRequest} from "../resource_cache";


export const SystemSettingsRouter: Router = express.Router();


const saveSettingItem = (req: Request) => (settings: SystemSettingsSchema, cb: (err: any) => void): void => {

    const authUser = req.user

    const authRole = authUser.role_id

    if (settings.locked && authRole !== 0) {
        cb(null)
        return
    }

    SystemSettingsModel.findById(settings._id, (err, sett) => {

        // Only allow master administrators to alter locked settings fields
        if (sett.locked && authRole !== 0) {
            cb(null)
            return
        }

        if (sett.allowed_roles.includes(authRole) || authRole <= 1) {

            sett.update({value: settings.value}, err => cb(err))

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

        ClearCacheValueByRequest(req)
    })
})
