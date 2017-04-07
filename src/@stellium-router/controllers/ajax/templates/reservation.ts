export const reservationEmailTemplate = (config: any) => {
    return `
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Website Contact Form</title>
    <style>
    /* /\/\/\/\/\/\/\/\/ CLIENT-SPECIFIC STYLES /\/\/\/\/\/\/\/\/ */
    #outlook a{padding:0;} /* Force Outlook to provide a "view in browser" message */
    .ReadMsgBody{width:100%;} .ExternalClass{width:100%;} /* Force Hotmail to display emails at full width */
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;} /* Force Hotmail to display normal line spacing */
    body, table, td, p, a, li, blockquote{-webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;} /* Prevent WebKit and Windows mobile changing default text sizes */
    table, td{mso-table-lspace: 0; mso-table-rspace: 0;} /* Remove spacing between tables in Outlook 2007 and up */
    img{-ms-interpolation-mode:bicubic;} /* Allow smoother rendering of resized image in Internet Explorer */
    body,table,p,h3 {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    </style>
</head>
<body style="padding: 16px;margin: 0;background-color: #ffffff;font-family: 'Helvetica Neue', Helvetica, arial, sans-serif; color:#353739">
<table style="width: 100%; max-width: 500px;background-color: white;margin: auto;padding: 16px;">
    <tbody>
    <tr>
        <td>
            <h2 style="font-weight: 300; margin-bottom:0">
                Grow Bali Website Reservation
            </h2>
        </td>
    </tr>
    <tr>
        <td style="border-bottom:1px solid #e5e7e9; padding-top:0px;">
           &nbsp;
        </td>
    </tr>
    <tr>
        <td style="height: 10px;">
           &nbsp;
        </td>
    </tr>
    <tr>
        <td>
            <p style="font-weight: 400; font-size: 14px; line-height:1.6; margin-top: 8px; margin-bottom: 8px;">
                <strong>Name: </strong>${decodeURIComponent(config.full_name)}
            </p>
        </td>
    </tr>
    <tr>
        <td>
            <p style="font-weight: 400; font-size: 14px; line-height:1.6; margin-top: 0; margin-bottom: 32px;">
                <strong>Email: </strong>${config.email}
            </p>
        </td>
    </tr>
    <tr>
        <td>
            <p style="font-weight: 400; font-size: 14px; line-height:1.6; margin-top: 0; margin-bottom: 32px;">
                <strong>Check In: </strong>${config.check_in_date}
            </p>
        </td>
    </tr>
    <tr>
        <td>
            <p style="font-weight: 400; font-size: 14px; line-height:1.6; margin-top: 0; margin-bottom: 32px;">
                <strong>Time: </strong>${decodeURIComponent(config.timereservation)}
            </p>
        </td>
    </tr>
    <tr>
        <td>
            <p style="font-weight: 400; font-size: 14px; line-height:1.6; margin-top: 0; margin-bottom: 32px;">
                <strong>Number of guests: </strong>${config.person}
            </p>
        </td>
    </tr>
    <tr>
        <td>
            <p style="font-weight: 400; font-size: 14px; line-height:1.6; margin-top: 0; margin-bottom: 32px;">
                <strong>Phone number: </strong>${config.phone}
            </p>
        </td>
    </tr>
    </tbody>
</table>
</body>
</html>
`
}