import * as fs from 'fs'
import * as path from 'path'
import * as async from 'async'
import * as colors from 'colors'
import * as mkdirp from 'mkdirp'
import * as browserify from 'browserify'
import * as babelify from 'babelify'
import * as uglify from 'uglifyify'
import {CachePath, StoragePath} from "../@stellium-common";
import ReadWriteStream = NodeJS.ReadWriteStream


const scriptBluePrint = [
    /*
     {
     from: path.resolve(ViewsPath, 'modules/footer/booking'),
     to: path.resolve(CachePath, 'js/footer/booking'),
     file_name: 'component.js'
     },
     */
    {
        from: path.resolve(StoragePath, 'scripts'),
        to: path.resolve(CachePath, 'js'),
        file_name: 'stellium.js'
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

            browserify(`${_bluePrint.from}/${_bluePrint.file_name}`)
            .transform(babelify, {presets: ["es2015"]})
            .transform(<(file: string, opts?: any) => ReadWriteStream>uglify)
            .bundle()
            .pipe(bundleFs)
        }
    })
}


export function compileScripts(cb: (err: any) => void): void {

    async.map(scriptBluePrint, compileScript, err => cb(err))
}
