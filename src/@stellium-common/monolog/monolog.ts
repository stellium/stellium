import 'colors';
import * as callsite from 'callsite'
import {MonologModel, MonologSchema} from './model'


const getErrorColor = (config: MonologSchema): string => {

    let severity = config.severity || 'severe'

    let color = 'red'

    switch (severity) {

        case 'moderate':
            color = 'yellow'
            break
        case 'light':
            color = 'green'
            break
        case 'ignore':
            color = 'blue'
            break
    }

    return color
}


let strLimit = 80

const fillRemainingSpace = (length) => {

    let spaces = ''

    for (let i = 0; i < strLimit - length; i++) spaces += ' '

    return spaces
}


const truncateMessage = (message: string): string => {

    if (message.length <= strLimit) return `| ${message}${fillRemainingSpace(message.length)} |`

    else return `| ${message} |`
}


/**
 * config Object
 * {
 *     file_path: String;
 *     line_number: Number(__line);
 *     error: Mixed;
 *     message: String;
 *     severity: Enum('sever', 'moderate', 'light')
 * }
 */
export const Monolog = (config: MonologSchema, callback?: Function) => {

    let stack = callsite()[1]

    // Get file path where the stack was called from
    config.file_path = stack.getFileName()

    // Get line number where the stack was called from
    config.line_number = stack.getLineNumber()

    // Set default severity value
    config.severity = config.severity || 'severe'

    if (typeof LOG_ERRORS !== 'undefined' && LOG_ERRORS) {

        // Console log in development
        let color = getErrorColor(config)

        /**
         * TODO(production): Make rootPath global
         * @date - 23 Mar 2017
         * @time - 10:08 PM
         */
        let filePath = config.file_path.replace(StelliumRootPath, '') + ' ' + config.line_number


        console.log()
        console.log('|----------------------------------------------------------------------------------|'[color])
        console.log('|                                      MONOLOG                                     |'[color])
        console.log('|----------------------------------------------------------------------------------|'[color])
        console.log(truncateMessage('File      : ' + filePath)[color])
        console.log(truncateMessage('Message   : ' + config.message)[color])
        if (config.error) console.log(truncateMessage('Error     : ' + config.error)[color])
        console.log(truncateMessage('Severity  : ' + config.severity)[color])
        console.log('|----------------------------------------------------------------------------------|'[color])
        console.log('| In production, this message would\'ve been written to the database instead        |'[color])
        console.log('|----------------------------------------------------------------------------------|'[color])
        console.log()
    } else {

        // Save to database in production
        MonologModel.create(config, (err, log) => {

            // Trigger callback if provided
            if (callback && typeof callback === 'function') callback(err, log)
        })
    }
}
