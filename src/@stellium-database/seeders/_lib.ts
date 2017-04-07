import * as fs from 'fs';
import * as path from 'path';
import * as colors from 'colors/safe';
import {SystemUserModel} from "../models/system_user";
import {RootPath} from "../../@stellium-common";
import {SystemUserSchema} from "../../@stellium-common";

const fillRemaining = (remains: number): string => {
    let str = '';
    for (let i = 0; i < remains; i++) {
        str += ' ';
    }
    return str;
};

const renderSpace = (length: number, closure: boolean = false) => {
    let str = '';
    for (let i = 0; i < (length - 2); i++) {
        str += closure ? '-' : ' ';
    }
    return str;
};

export const SeedConsole = (message: string, color: string = 'green', closure: boolean = false) => {

    let stringLength = 100,
        msgLength = message.length,
        emptySpace = stringLength - msgLength - 4;

    console.log(colors[color](`|${renderSpace(stringLength, closure)}|`));
    console.log(colors[color](`| ${message + fillRemaining(emptySpace)} |`));
    console.log(colors[color](`|${renderSpace(stringLength, closure)}|`));
};


export const readSeederFile = (collection: string, cb) => {

    // Just in case the developer left .json in the collection name, remove it
    collection = collection.replace(/.json$/g, '');

    fs.readFile(path.resolve(RootPath, 'seeders', collection + '.json'), 'utf8', (err, result) => {

            if (err) {
                SeedConsole(`Project scoped ${collection} seeder does not exist, using global seeder.`, 'yellow')
            }

            fs.readFile(path.resolve(RootPath, '..', 'common/seeders', collection + '.json'), 'utf8', (err, commonResult) => {

                let returnedData = result ? JSON.parse(result) : []

                if (!err) {
                    returnedData = [].concat(returnedData, JSON.parse(commonResult))
                }

                cb(err, returnedData)
            })
        }
    );
};


export const FindOneUser = (cb: (err: any, user?: SystemUserSchema) => void): void => {
    SystemUserModel.findOne({}, (err, user) => cb(err, user));
};
