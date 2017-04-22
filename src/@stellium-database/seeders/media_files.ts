import * as fs from 'fs'
import * as glob from 'glob'
import * as async from 'async'
import * as mime from 'mime-types'
import * as sizeOf from 'image-size'
import {SeedConsole, FindOneUser} from './_lib'
import {MediaFileModel} from '../models/media_file'
import {MediaPath} from '../../@stellium-common'


const sizeableExtensions = ['jpeg', 'jpg', 'png', 'svg'];


export const sizeableFile = (filename: string) => {
    let [, extension] = filename.split('.');
    return sizeableExtensions.includes(extension);
};


// MediaPath
const removeFiles = (cb: (err: any) => void): void => {
    MediaFileModel.remove({}, err => cb(err));
};


const indexFiles = (user, cb) => glob(MediaPath + '/**/*', {nodir: true}, (err, files) => cb(err, user, files));


const extractFileMetaData = (user) => (file, cb) => {


    let nameChunks = file.replace(MediaPath, '').split('/')

    let folderFileName = file.replace(MediaPath, '')

    let fileName = nameChunks[nameChunks.length - 1]

    if (fileName === 'blank.png') {
        cb(null)
        return
    }

    MediaFileModel.create({
        url: file.replace(MediaPath, '').replace(/^\/|\/$/g, ''),
        title: fileName,
        folder: '/' + folderFileName.replace(fileName, '').replace(/^\/|\/$/g, ''),
        type: mime.lookup(file),
        size: fs.statSync(file).size,
        width: sizeableFile(fileName) ? sizeOf(file).width : null,
        height: sizeableFile(fileName) ? sizeOf(file).height : null,
        description: fileName,
        trash_name: null,
        user_id: user._id
    }, err => cb(err));
};


const scanFiles = (user, files, cb) => {
    async.map(files, extractFileMetaData(user), err => cb(err));
};


const seedFiles = (cb: (err: any) => void): void => {
    async.waterfall([
        FindOneUser,
        indexFiles,
        scanFiles
    ], err => cb(err));
};


export const FilesSeeder = (cb: (err: any) => void): void => {
    SeedConsole('Seeding Media');
    async.series([
        removeFiles,
        seedFiles,
    ], err => {
        cb(err);
    });
};
