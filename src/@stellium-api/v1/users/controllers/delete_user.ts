import * as ejs from 'ejs'
import * as path from 'path'
import * as nodemailer from 'nodemailer'
import {ClearCacheValueByRequest} from '../../resource_cache'
import {
    StoragePath,
    getSettingsByKey,
    ResolveMailConfiguration,
    SettingsKeys,
    CacheKeys,
    Monolog,
} from '../../../../@stellium-common'
import {SystemUserModel} from '../../../../@stellium-database'


export const deleteUser = (req, res) => {

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
}
