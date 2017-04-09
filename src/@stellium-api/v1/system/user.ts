import * as fs from 'fs'
import * as ejs from 'ejs'
import * as path from 'path'
import * as async from 'async'
import * as multer from 'multer'
import * as mkdirp from 'mkdirp'
import * as express from 'express'
import * as nodemailer from 'nodemailer'
import {Router} from "express"
import {SystemUserModel} from "../../../@stellium-database"
import {ClearCacheValueByRequest} from '../resource_cache'
import {CacheKeys, Monolog, StoragePath, SettingsKeys, ResolveMailConfiguration, getSettingsByKey} from "../../../@stellium-common"


export const UsersRouter: Router = express.Router()


const TempPath = path.resolve(StoragePath, '.tmp')


const storage = multer.diskStorage({
    // Temporary destination for file uploads
    destination: (req, file, cb) => mkdirp(TempPath, err => cb(err, TempPath))
})


const upload = multer({storage: storage});


UsersRouter.post('/profile-picture', upload.single('file'), (req, res) => {

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
})


/**
 * Creates a new user
 */
UsersRouter.post('/', (req, res) => {

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
})


const checkForConflict = (_id: string, field: string, value: any, cb: (err: any) => void): void => {

    const query = {
        [field]: value
    }

    if (_id) {
        query._id = {
            '$ne': _id
        }
    }

    SystemUserModel
    .findOne(query)
    .exec((err, user) => {

        let error = null

        if (err) error = err

        else if (user) error = {type: 'conflict', field: field}

        cb(error)
    })
}


UsersRouter.put('/self', (req, res) => {

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
})


UsersRouter.put('/password', (req, res) => {


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
})


/**
 * Updates a user based on it's id
 */
UsersRouter.put('/:modelId', (req, res) => {

    if (req.user.role_id > 1) {
        res.status(401).send('You don\'t have permission to edit users')
        Monolog({
            message: 'A peasant managed to attempt to edit a user'
        })
        return
    }

    SystemUserModel.findById(req.params.modelId).exec((err, user) => {

        if (user.role_id === 0) {
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
})


/**
 * Deletes a user based on it's id
 */
UsersRouter.delete('/:userId', (req, res) => {

    SystemUserModel.findById(req.params.userId, (err, user) => {

        if (err) {
            res.status(500).send('Internal Server Error')
            Monolog({
                message: 'Error retrieving user by id prior to deleting',
                error: err
            })
            return
        }

        if (req.query.confirm_email !== user.email) {
            res.status(409).send('The confirmation email doest not match the user\'s email address.')
            return
        }

        user.deleted_at = new Date

        user.save(err => {

            if (err) {
                res.status(500).send('Internal Server Error')
                Monolog({
                    message: 'Error soft deleting user',
                    error: err
                })
                return
            }

            res.send({
                message: `User ${user.first_name} ${user.last_name} successfully deleted`
            })


            if (req.query.notify && req.query.notify === 'true') {
                // notify, note, confirm_email
                // mail user with req.query.note

                const websiteTitle = getSettingsByKey(SettingsKeys.WebsiteTitle, req.app.get(CacheKeys.SettingsKey), true)

                ResolveMailConfiguration((err, config) => {

                    ejs.renderFile(path.resolve(StoragePath, 'views/email_templates', 'user_delete.ejs'), {
                        message: req.query.note,
                        title: websiteTitle
                    }, (err, htmlTemplate) => {

                        console.log('htmlTemplate', htmlTemplate)

                        let mailData = {
                            from: req.user.email,
                            to: user.email,
                            cc: req.user.email,
                            subject: websiteTitle + ' - Your User Account Has Been Deleted',
                            text: req.query.note,
                            html: htmlTemplate
                        }

                        nodemailer.createTransport(config).sendMail(mailData, (err, status) => {
                            console.log('err', err)
                            console.log('status', status)
                        })
                    })
                })
            }

            ClearCacheValueByRequest(req)
        })
    })
})
