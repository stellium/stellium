import {SignJwtToken} from '../_lib/sign_token'
import {CommonErrors} from '../../../@stellium-common'


export const RefreshTokenController = (req, res) => {

    // Removes conflicting date fields
    // ejwt will complain about expiry dates already set in th object,
    // we need to make sure that these get removed
    const pristineUser = {...req.user, iat: undefined, exp: undefined}

    SignJwtToken(pristineUser, (err, token) => {

        if (err) {
            res.status(500).send(CommonErrors.InternalServerError)
            return
        }

        res.send({token})
    })
}
