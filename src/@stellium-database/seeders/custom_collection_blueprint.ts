import * as async from 'async'
import {CustomCollectionBlueprintModel} from '../models/custom_collection_blueprint'
import {FindOneUser, readSeederFile, SeedConsole} from './_lib'
import {SystemUserSchema} from '../../@stellium-common'


type Callback = (err: any, res?: any) => void

// CustomCollectionBlueprintModel

const removeBlueprints = (cb: Callback) => {

    CustomCollectionBlueprintModel.remove({}, err => cb(err))
}


const populateMetaDataAndSave = (user: SystemUserSchema) => (blueprint: any, cb: Callback) => {

    const seed = {
        user_id: user._id,
        ...blueprint
    }

    CustomCollectionBlueprintModel.create(seed, err => cb(err))
}


const iterateAndSaveBlogPosts = (user, cb): void => {
    readSeederFile('custom_collection_blueprint', (err, posts) => {
        async.map(posts, populateMetaDataAndSave(user), err => cb(err))
    })
}


const seedCollectionBlueprints = (cb: (err: any) => void): void => {
    async.waterfall([
        FindOneUser,
        iterateAndSaveBlogPosts
    ], err => cb(err))
}


export const CustomCollectionBlueprintSeeder = (cb: (err: any) => void) => {
    SeedConsole("Seeding Custom Collection Blueprints")
    async.series([
        removeBlueprints,
        seedCollectionBlueprints
    ], err => cb(err))
}
