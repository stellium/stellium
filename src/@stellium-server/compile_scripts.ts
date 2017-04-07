import * as fs from 'fs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'
import * as browserify from 'browserify'
import * as babelify from 'babelify'
import * as uglify from 'uglifyify'
import {CachePath, StoragePath} from "../@stellium-common/path/common_paths";
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


export function compileScripts() {

    scriptBluePrint.forEach(_bluePrint => {

        fs.access(`${_bluePrint.from}/${_bluePrint.file_name}`, err => {

            // Compile only if scripts exists
            if (!err) {

                console.log(`Start compiling ${_bluePrint.file_name}`)

                mkdirp.sync(_bluePrint.to)

                const bundleFs = fs.createWriteStream(`${_bluePrint.to}/${_bluePrint.file_name}`)

                //now listen out for the finish event to know when things have finished
                bundleFs.on('finish', function () {
                    console.log(`Finished compiling ${_bluePrint.file_name}`)
                })

                browserify(`${_bluePrint.from}/${_bluePrint.file_name}`)
                .transform(babelify, {presets: ["es2015"]})
                .transform(<(file: string, opts?: any) => ReadWriteStream>uglify)
                .bundle()
                .pipe(bundleFs)
            }
        })
    })
}
