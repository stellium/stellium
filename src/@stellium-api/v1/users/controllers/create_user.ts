import {ClearCacheValueByRequest} from '../../resource_cache'
import {Monolog} from '../../../../@stellium-common'
import {SystemUserModel} from '../../../../@stellium-database'
import {checkForConflict} from '../_lib/check_conflicting_user'


export const createNewUser = (req, res) => {

    const authRole = req.user.role_id

    if (authRole > 1) {
        res.status(401).send('Your account role does not allow you to create users. This action will be reported.')
        return
    }

    const newUser = req.body

    if (newUser.role_id === 0) {
        res.status(401).send('Cannot create master admin. Operation not allowed.')
        return
    }

    let error = null;

    if (newUser.email === '') {
        error = 'Email is required'
    }

    if (newUser.username === '') {
        error = 'Username is required'
    }

    if (newUser.username.length < 6) {
        error = 'Username needs to be at least 6 characters'
    }

    if (newUser.username.length < 6) {
        error = 'Username needs to be at least 6 characters'
    }

    if (newUser.first_name === '') {
        error = 'First name is required'
    }

    if (error) {
        res.status(301).send(error)
        return
    }

    async.parallel([
        async.apply(checkForConflict, null, 'email', newUser.email),
        async.apply(checkForConflict, null, 'username', newUser.username),
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

        SystemUserModel.register(newUser, newUser.password, err => {

            if (err) {
                Monolog({
                    message: 'Error registering user after resolving conflicts',
                    error: err
                })
                res.status(500).send('Internal Server Error')
                return
            }

            res.send({
                message: 'User has been created successfully.',
            })

            ClearCacheValueByRequest(req)
        })
    })
}
