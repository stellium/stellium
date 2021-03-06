import * as async from 'async'
import * as nodemailer from 'nodemailer'
import {SystemSettingsSchema, ENV, Monolog} from '../../../../@stellium-common'
import {SystemSettingsModel} from '../../../../@stellium-database'
import {Request} from 'express'
import {basicEmailTemplate} from './basic_template'


const getSettingsValueByKey = (key: string, settings: SystemSettingsSchema[]) => {

    const set = settings['find'](_set => _set.key === key)

    return set && set.value
}


export const resolveConfigurationValues = (req: Request, cb: (err: any, config?: any, req?: Request) => void): void => {

    SystemSettingsModel.find({}, (err, settings) => {

        const config = {
            host: getSettingsValueByKey('smtp_host', settings),
            port: getSettingsValueByKey('smtp_port', settings),
            secure: getSettingsValueByKey('smtp_ssl', settings),
            auth: {
                user: getSettingsValueByKey('smtp_auth_user', settings),
                pass: getSettingsValueByKey('smtp_auth_password', settings),
            }
        }

        cb(err, config, req)
    })
}


const compileEmailTemplate = (config: any, req: Request, cb: (err: any, config?: any, mailData?: any) => void): void => {

    let params = req.body

    let escapedMessage = params.message.replace(/(?:\r\n|\r|\n)/g, '<br />')

    let ccEmailString = params.cc_email

    let ccEmail = []

    try {

        ccEmail = ccEmailString.split(',');

        if (!ENV.production) ccEmail[ccEmail.length] = 'boris@fleava.com';

    } catch (e) {

        ccEmail = ['boris@fleava.com'];
    }

    SystemSettingsModel.findOne({key: 'website_title'}, (err, settings) => {

        let mailData = {
            from: params['email'],
            to: params['to_email'],
            cc: ccEmail,
            subject: settings.value + ' - Contact Request',
            text: params.message,
            html: basicEmailTemplate(settings.value, params.first_name, params.last_name, params.email, escapedMessage)
        }
        cb(err, config, mailData)
    })
}


const sendEmail = (config, data, cb: (err, response) => void) => {

    nodemailer.createTransport(config).sendMail(data, cb)
}


export const BasicContactHandler = (req, res) => {

    async.waterfall([
        async.apply(resolveConfigurationValues, req),
        compileEmailTemplate,
        sendEmail
    ], err => {

        if (err) {
            res.status(500).send()
            Monolog({
                message: 'Error while attempting to send an ajax contact request',
                error: err
            })
            return
        }
        res.send('Success. Email was sent successfully.')
    })
}
