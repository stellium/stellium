import * as fs from 'fs'
import * as path from 'path'
import {SystemUserModel} from '../../../../@stellium-database'
import {Monolog} from '../../../../@stellium-common'
import {ClearCacheValueByRequest} from '../../resource_cache'
import {StoragePath} from '../../../../@stellium-common/path/common_paths'


export const uploadProfilePicture = (req, res) => {

    if (!req['file']) {
        res.status(409).send('You cannot post to this address without providing a profile image')
        Monolog({
            message: 'The user somehow managed to POST to File without a File object'
        })
        return
    }

    const systemUserImagePath = path.resolve(StoragePath, 'media', 'users')

    const nameChunks = req.file.originalname.split('.')

    const ext = nameChunks[nameChunks.length - 1]

    const imageFileName = req.user.username + '.' + ext

    const imageDestination = path.resolve(systemUserImagePath, imageFileName)

    fs.rename(req.file.path, imageDestination, err => {

        if (err) {
            res.status(500).send('An error occurred while uploading the file.')
            Monolog({
                message: 'Error while storing user profile image',
                error: err
            })
            return
        }

        SystemUserModel.findById(req.user._id, (err, user) => {

            user.image = imageFileName

            user.save(err => {

                if (err) {
                    res.status(500).send('There was an error while updating your profile picture. Please try again in a moment.')
                    Monolog({
                        message: 'User has successfully uploaded a profile image but the model failed to update',
                        error: err
                    })
                    return
                }

                res.send({message: 'Your profile picture has been updated successfully.'})

                ClearCacheValueByRequest(req)
            })
        })
    })
}
