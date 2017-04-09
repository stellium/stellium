import * as nodemailer from 'nodemailer'
import {EcommerceCartSchema} from '../../../@stellium-common'
import {ENV, Monolog} from '../../../@stellium-common'


/**
 * TODO(remove): remove
 * @date - 05 Apr 2017
 * @time - 1:47 PM
 */
let DEVELOPMENT = true;

export const OrderMailer = (req, res, items: EcommerceCartSchema[]) => {

    let smtpConfig = {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // use SSL
            auth: {
                user: ENV.mailer.email,
                pass: ENV.mailer.secret
            }
        },
        transporter = nodemailer.createTransport(smtpConfig);

    let ccEmailString = 'boris@fleava.com',
        ccEmail = [];

    try {
        // Check if cc email was provided
        ccEmail = ccEmailString.split(',');
        if (DEVELOPMENT) ccEmail[ccEmail.length] = 'boris@fleava.com';
        if (DEVELOPMENT) ccEmail[ccEmail.length] = 'sfauzanashri@gmail.com';
    } catch (e) {
        // Set default cc email to be boris@fleava.com when no cc email provided
        ccEmail = ['boris@fleava.com', 'sfauzanashri@gmail.com'];
    }

    let htmlData = {
        cartItems: items,
    };

    res.render('emails/order', htmlData, (err, _html) => {

        if (err) {
            res.status(500).send('An error occurred while sending the email');
            Monolog({
                message: 'Error rendering order receipt email',
                error: err
            });
            return;
        }

        let mailData = {
            from: 'info@stellium.io',
            to: 'info@stellium.io',
            cc: ccEmail,
            /**
             * TODO(boris): Change with DB stored title
             * @date - 13 Mar 2017
             * @time - 12:56 PM
             */
            subject: 'Website Title' + ' - Order Receipt TEST',
            // text: _html,
            html: _html
        };


        const mailCb = (err) => {
            /** There was an error while attempting to send the email. */
            if (err) {
                Monolog({
                    message: 'Error sending order email',
                    error: err
                });
                return
            }
            /** The email was sent successfully, send a response to request */
            if (DEVELOPMENT) console.log('Success. Email was sent successfully.');
        };
        // Send email
        transporter.sendMail(mailData, mailCb);
    });
};
