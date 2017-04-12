import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob'
import * as async from 'async'


export const ReadSizeRecursive = (item, cb) => {

    console.log('item', item)

    let totalSize = 0

    let it = 0

    glob(item + '**', (err, files) => {

        files.forEach(_filePath => {

            fs.lstat(_filePath, (err, stats) => {

                if (err) {
                    cb(err)
                    return
                }

                if (!stats.isDirectory()) {
                    totalSize += stats.size
                }

                if (++it >= files.length) {
                    cb(err, totalSize)
                    return
                }
            })
        })
    })

    /*
     fs.lstat(item, (err, stats) => {

     if (err) {
     cb(err)
     return
     }

     if (!stats.isDirectory()) {
     cb(null, 0)
     return
     }

     let total = stats.size

     fs.readdir(item, (err, list) => {

     if (err) {
     cb(err)
     return
     }

     async.forEach(
     list,
     (dirItem, callback) => {

     ReadSizeRecursive(path.join(item, dirItem), (err, size) => {

     total += size

     callback(err)
     })
     },
     (err) => {

     cb(err, total)
     }
     )
     })
     })
     */
}