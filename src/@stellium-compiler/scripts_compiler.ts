import * as fs from 'fs'
import * as path from 'path'
import * as async from 'async'
import * as colors from 'colors'
import * as mkdirp from 'mkdirp'
import * as browserify from 'browserify'
import * as babelify from 'babelify'
import {CachePath, StoragePath} from '../@stellium-common'
import ReadWriteStream = NodeJS.ReadWriteStream


export interface ScriptCompilerBluePrint {
    from: string,
    to: string,
    file_name: string
}


const scriptBluePrint: ScriptCompilerBluePrint[] = [
    /*
     {
     from: path.resolve(ViewsPath, 'modules/footer/booking'),
     to: path.resolve(CachePath, 'js/footer/booking'),
     file_name: 'component.js'
     },
     */
    {
        from: path.resolve(StelliumRootPath, '../../', 'lib', 'scripts'),
        to: path.resolve(CachePath, 'js'),
        file_name: 'stellium.js'
    },
    {
        from: path.resolve(StelliumRootPath, '../../', 'lib', 'scripts'),
        to: path.resolve(CachePath, 'js'),
        file_name: 'input-bindings.js'
    }
]

const compileScript = (_bluePrint, cb: (err: any) => void): void => {

    fs.access(`${_bluePrint.from}/${_bluePrint.file_name}`, err => {

        // Compile only if scripts exists
        if (!err) {

            console.log(colors.blue(`Start compiling ${_bluePrint.file_name}`))

            mkdirp.sync(_bluePrint.to)

            const bundleFs = fs.createWriteStream(`${_bluePrint.to}/${_bluePrint.file_name}`)

            //now listen out for the finish event to know when things have finished
            bundleFs.on('finish', function () {
                console.log(colors.green(`Finished compiling ${_bluePrint.file_name}`))
                cb(null)
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


export function compileScripts(blueprint: ScriptCompilerBluePrint[] = [], cb?: (err: any) => void): void {

    let bluePrintBundle = [].concat(scriptBluePrint, blueprint)

    async.map(bluePrintBundle, compileScript, err => cb(err))
}
