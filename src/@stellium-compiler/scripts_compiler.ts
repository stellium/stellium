import * as fs from 'fs'
import * as ncp from 'ncp'
import * as path from 'path'
import * as async from 'async'
import * as rimraf from 'rimraf'
import * as colors from 'colors'
import * as mkdirp from 'mkdirp'
import * as browserify from 'browserify'
import * as babelify from 'babelify'
import {CachePath} from '../@stellium-common'
import ReadWriteStream = NodeJS.ReadWriteStream

const Copy = ncp.ncp


export interface ScriptCompilerBluePrint {
    from: string,
    to: string,
    file_name: string
}

const systemRootPath = path.resolve(StelliumRootPath, '../../')


const scriptBluePrint: ScriptCompilerBluePrint[] = [
    {
        from: path.resolve(systemRootPath, 'lib', 'scripts'),
        to: path.resolve(CachePath, 'js'),
        file_name: 'stellium.js'
    },
    {
        from: path.resolve(systemRootPath, 'lib', 'scripts'),
        to: path.resolve(CachePath, 'js'),
        file_name: 'socket.js'
    },
    {
        from: path.resolve(systemRootPath, 'lib', 'scripts'),
        to: path.resolve(CachePath, 'js'),
        file_name: 'input-bindings.js'
    }
]

const compileScript = (_bluePrint, cb: (err: any) => void): void => {

    fs.access(`${_bluePrint.from}/${_bluePrint.file_name}`, err => {

        // Compile only if scripts exists
        if (!err) {

            mkdirp.sync(_bluePrint.to)

            const bundleFs = fs.createWriteStream(`${_bluePrint.to}/${_bluePrint.file_name}`)

            //now listen out for the finish event to know when things have finished
            bundleFs.on('finish', (err) => {

                if (err) {
                    cb(err)
                    return
                }

                mkdirp(path.resolve(CachePath, 'css'), err => {

                    if (err) {
                        cb(err)
                        return
                    }

                    Copy(path.resolve(systemRootPath, 'lib', 'css'), path.resolve(CachePath, 'css'), err => {

                        mkdirp(path.resolve(CachePath, 'fonts'), err => {

                            if (err) {
                                cb(err)
                                return
                            }

                            Copy(path.resolve(systemRootPath, 'lib', 'fonts'), path.resolve(CachePath, 'fonts'), err => {

                                cb(err)
                            })
                        })
                    })
                })
            })

            // transpile ES6+ to ES5
            let browserifyOptions = browserify(`${_bluePrint.from}/${_bluePrint.file_name}`)
                .transform(babelify, {presets: ['es2015']})

            // minify scripts in production
            if (!DEVELOPMENT) {
                browserifyOptions = browserifyOptions.transform(<any>{
                    'global': true
                }, 'uglifyify')
            }

            browserifyOptions.bundle()
                .pipe(bundleFs)
        }
    })
}


export function CompileScripts(blueprint: ScriptCompilerBluePrint[] = [], cb?: (err: any) => void): void {

    let bluePrintBundle = [].concat(scriptBluePrint, blueprint)

    // Delete cache Path before compiling scripts to it
    rimraf(CachePath, () => {

        console.log(colors.blue(`Scripts compiler started`))

        async.map(bluePrintBundle, compileScript, err => {

            console.log(colors.green(`Scripts compiler finished`))

            cb(err)
        })
    })
}
