import {Monolog} from '../../../../@stellium-common'
import {SystemUserModel} from '../../../../@stellium-database'


export const updateUserPassword = (req, res) => {


    if (!req.body.old_password || !req.body.new_password || !req.body.confirm_password) {
        res.status(422).send('Must provide all password fields')
        return
    }

    // New password and confirm password do not match
    if (req.body.new_password !== req.body.confirm_password) {
        res.status(309).send('Confirmation password does not match the new password')
        return
    }

    // Find the authenticated user by their email
    SystemUserModel.findById(req.user._id, (err, user) => {


        // The user was not found. This scenario is extremely unlikely.
        if (err) {
            res.status(401).send('There was a problem finding your account, contact your developer for assistance')
            Monolog({
                message: 'User not found while updating password',
                error: err
            })
            return
        }

        // Authenticate the user with the old password to make sure they have the right to change their password
        user.authenticate(req.body.old_password, (err) => {

            // The old password did not match the new password, auth failed
            if (err) {
                res.status(401).send('We could not authenticate your old password, are you sure this password is correct?')
                return
            }

            user.setPassword(req.body.new_password, (err) => {

                // Somehow, something failed in the system to set the new password, check for validation
                if (err) {
                    res.status(500).send('Error saving new password for user')
                    Monolog({
                        message: 'Error updating user password',
                        error: err
                    })
                    return
                }

                user.updated_at = new Date

                user.save((err) => {

                    // The user object's password has been changed but could not be saved into the database
                    if (err) {
                        res.status(500).send('Error saving new password for user.')
                        return
                    }

                    // Password change was successful so everything works!
                    res.send({
                        message: 'Your password has been updated successfully.'
                    })
                })
            })
        })
    })
}
