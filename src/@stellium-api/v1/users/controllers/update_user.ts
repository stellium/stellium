import {ClearCacheValueByRequest} from '../../resource_cache'
import {checkForConflict} from '../_lib/check_conflicting_user'
import {Monolog} from '../../../../@stellium-common'
import {SystemUserModel} from '../../../../@stellium-database'


export const updateUser = (req, res) => {

    if (req.user.role_id > 1) {
        res.status(401).send('You don\'t have permission to edit users')
        Monolog({
            message: 'A peasant managed to attempt to edit a user'
        })
        return
    }

    SystemUserModel.findById(req.params.modelId).exec((err, user) => {


        // Only master admin accounts can modify other master admin accounts
        if (user.role_id === 0 && req.user.role_id > 0) {
            res.status(401).send('The master admin\'s account cannot be modified')
            Monolog({
                message: 'User attempted to delete master admin account'
            })
            return
        }

        if (err) {
            res.status(500).send('Internal Server Error')
            Monolog({
                message: 'Error finding user prior to updateing',
                error: err
            })
            return
        }

        const updatedUser = {...user._doc, ...req.body}

        async.parallel([
            async.apply(checkForConflict, user._id, 'email', updatedUser.email),
            async.apply(checkForConflict, user._id, 'username', updatedUser.username),
        ], err => {

            if (err) {
                if (err['type'] === 'conflict') {
                    res.status(409).send(`A user with that ${err['field']} already exists`)
                    return
                }

                Monolog({
                    message: 'Error while matching user update conflicts',
                    error: err
                })
                res.status(500).send('Internal Server Error')
                return
            }

            user.update(updatedUser, err => {

                if (err) {
                    Monolog({
                        message: 'Error updating user after resolving conflicts',
                        error: err
                    })
                    res.status(500).send('Internal Server Error')
                    return
                }

                res.send({
                    message: 'User has been updated successfully.',
                    user: updatedUser
                })

                ClearCacheValueByRequest(req)
            })
        })
    })
}
