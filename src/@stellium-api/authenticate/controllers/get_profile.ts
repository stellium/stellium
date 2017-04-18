import {SystemUserModel} from '../../../@stellium-database/models/system_user'
import {CommonErrors} from '../../../@stellium-common/keys/errors'
import {Monolog} from '../../../@stellium-common/monolog/monolog'


export const GetSelfController = (req, res) => {

    SystemUserModel.findById(req.user._id, (err, user) => {

        if (err) {
            res.status(500).send(CommonErrors.InternalServerError)
            Monolog({
                message: 'Error while attempting to retrieve user from database by JWT Token payload',
                error: err
            })
            return
        }

        if (!user) {
            res.status(401).send('Expired or need refresh')
            return
        }

        res.send(user)
    })
}
