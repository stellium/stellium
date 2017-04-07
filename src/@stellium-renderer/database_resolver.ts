import * as async from 'async';
import * as mongoose from 'mongoose';
import {BlogPostModel} from "../@stellium-database";
import {Monolog} from "../@stellium-common";
import {WebsitePageSchema} from "../@stellium-common";


// A list of expose-able database collections
// Imagine if system_user could be resolved within a module
const allowedResolvedCollection = [
    {
        collection: "blog_posts",
        model: BlogPostModel,
    }
]


const collectionIsExposable = (databaseMap: {collection: string}): mongoose.Model<any> => {

    if (!databaseMap || !databaseMap.collection) return null

    const allowPair = allowedResolvedCollection.filter(_allow => _allow.collection === databaseMap.collection)[0]

    return allowPair && allowPair.model
};


const resolveDataDependenciesIfRequested = (_module, cb) => {

    const resolverModel = collectionIsExposable(_module.database_resolver)

    if (_module.database_resolver && resolverModel) {

        const config = _module.database_resolver

        config.query || (config.query = {})

        config.sort || (config.sort = {})

        let baseQuery = {deleted_at: null}

        let sort = {updated_at: -1, created_at: -1}

        let query = resolverModel.find({...baseQuery, ...config.query})

        query = query.sort({...sort, ...config.sort})

        if (config.limit) query = query.limit(config.limit)

        query
        .populate('user')
        .exec((err, data) => {

            // attach the resolved data to the module
            _module['resolved_data'] = data

            cb(err, _module)
        })

    } else cb(null, _module)
};


export const ResolveDatabaseDependencies = (pageData: WebsitePageSchema,
                                            cb: (err?: any, resolvedPage?: WebsitePageSchema) => void): void => {

    async.map(pageData.modules, resolveDataDependenciesIfRequested, (err, modules) => {

        if (err) {
            cb(err)
            Monolog({
                message: 'Error resolving database dependencies is modules for page ' + pageData._id,
                error: err
            })
            return
        }
        let resolvePageData = Object.assign(pageData, {modules})
        cb(err, resolvePageData)
    })
}
