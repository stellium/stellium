import {SystemUserModel} from '../../../../@stellium-database'
import {CleanUser} from '../../../authenticate/_lib/clean_user'


export const getUserById = (req, res, next) => {

    SystemUserModel.findOne({_id: req.params.userId, deleted_at: null}, (err, user) => {

        const cleanUser = CleanUser(user._doc)

        res.send(cleanUser)
    })
}
