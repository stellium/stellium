import {SystemUserModel} from '../../../../@stellium-database'
import {Monolog} from '../../../../@stellium-common'


export const getAuthUser = (req, res) => {

    const update = {
        email: req.body['email'],
        first_name: req.body['first_name'],
        last_name: req.body['last_name'],
        updated_at: new Date
    }

    SystemUserModel
    .findOneAndUpdate({_id: req.user._id}, update, {'new': true}, (err, user) => {

        if (err) {
            res.status(401).send('Error updating user. Try again in a moment or contact your developer for assistance.')
            Monolog({
                message: 'Error updating user',
                error: err
            })
            return
        }

        res.send({
            message: 'Your profile has been updated successfully',
            user: user
        })
    })
}
