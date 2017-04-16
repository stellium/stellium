import * as async from 'async'
import {CustomCollectionBlueprintModel} from '../models/custom_collection_blueprint'
import {FindOneUser, readSeederFile, SeedConsole} from './_lib'
import {SystemUserSchema} from '../../@stellium-common'
import {CustomCollectionModel} from '../models/custom_collection'


type Callback = (err: any, res?: any) => void

// CustomCollectionBlueprintModel

const removeCollection = (cb: Callback) => {

    CustomCollectionModel.remove({}, err => cb(err))
}


const populateMetaDataAndSave = (user: SystemUserSchema, collection_id: string) => (collectionData: any, cb: Callback) => {

    const seed = {
        user_id: user._id,
        collection_id: collection_id,
        ...collectionData
    }

    CustomCollectionModel.create(seed, err => cb(err))
}


const iterateAndSaveCollectionData = (user, cb): void => {

    CustomCollectionBlueprintModel.findOne({}, (err, coll) => {

        readSeederFile('custom_collection', (err, posts) => {
            async.map(posts, populateMetaDataAndSave(user, coll._id), err => cb(err))
        })
    })
}


const seedCollectionData = (cb: (err: any) => void): void => {
    async.waterfall([
        FindOneUser,
        iterateAndSaveCollectionData
    ], err => cb(err))
}


export const CustomCollectionSeeder = (cb: (err: any) => void) => {
    SeedConsole("Seeding Custom Collection Data")
    async.series([
        removeCollection,
        seedCollectionData
    ], err => cb(err))
}
