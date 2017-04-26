import {SystemUserModel} from '../../../../@stellium-database'
import {cleanUserByRole} from '../_lib/clean_by_role'


export const getAllUsers = (req, res, next) => {

    SystemUserModel.find({deleted_at: null}, (err, users) => {

        const filteredUsers = cleanUserByRole(users, req, res)

        res.send(filteredUsers)
    })
}
