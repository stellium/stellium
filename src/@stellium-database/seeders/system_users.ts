import * as async from 'async'
import {SeedConsole, readSeederFile} from './_lib'
import {SystemUserModel} from '../models/system_user'
import {SystemUserGroupModel} from '../models/system_user_group'
import {SystemUserSchema} from '../../@stellium-common'


const removeData = (cb: (err: any) => void): void => {

    const removeUsers = (cb: (err: any) => void) => SystemUserModel.remove({}, err => cb(err))

    const removeUserGroups = (cb: (err: any) => void) => SystemUserGroupModel.remove({}, err => cb(err))

    async.parallel([
        removeUsers,
        removeUserGroups,
    ], err => cb(err))
}


const seedUserGroups = (cb: (err: any) => void): void => {

    const createUserGroup = (user, cb) => SystemUserGroupModel.create(user, err => cb(err))

    readSeederFile('user_groups', (err, userGroups) => async.map(userGroups, createUserGroup, err => cb(err)))
}


const registerUser = (user: SystemUserSchema, cb: (err: any) => void): void => {

    let password = user.password || 'fleava'

    SystemUserModel.register(new SystemUserModel(user), password, err => cb(err))
}


const seedUsers = (cb: (err: any) => void): void => readSeederFile('users', (err, users) => async.map(users, registerUser, err => cb(err)))


export const UsersSeeder = (cb: (err: any) => void): void => {
    SeedConsole("Seeding Users")
    async.series([
        removeData,
        seedUserGroups,
        seedUsers,
    ], err => cb(err))
}
