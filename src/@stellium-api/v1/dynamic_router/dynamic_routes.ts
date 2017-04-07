import * as redis from 'redis'
import {Request, Response} from 'express'
import {Model} from 'mongoose'
import {
    BlogPostModel,
    WebsitePageModel,
    SystemUserModel,
    SystemSettingsModel
} from '../../../@stellium-database'
import {CacheQueryResult} from "../resource_cache";


const redisClient = redis.createClient()


export interface DynamicRouteMethod {

    method: string

    /**
     * A function that will be executed when the request has completed
     *
     * e.g
     * POST to /v1/website/pages
     * When a user creates or updates a page, we wan't to invalidate the redis cache so
     * the page goes through the renderer and gets updated before being saved to redis
     * cache again
     *
     * function deletePageCache() {
     *     redis.flushAll()
     * }
     *
     * ...route config:
     * {
     *     method: 'create',
     *     hook: deletePageCache,
     *     role_id: 1
     * }
     *
     * The `deletePageCache` function will be executed when the page has been store to the database
     * thus, invalidating the page cache
     */
    hook?: any

    query?: {
        sort: any
    }
    role_id?: number | number[]
    filter?: (...input: any[]) => any
}

export interface DynamicRouteChildSchema {
    route: string
    model: Model<any>
    methods: DynamicRouteMethod[]
}


export interface DynamicRouteSchema {
    route: string
    children: DynamicRouteChildSchema[]
}


const deletePageCache = (model) => {

    // Scans all keys for cached page documents
    redisClient.keys('page_cache_address*', (err, keys) => {
        // Loops through the matching keys and delete one-by-one
        // this is only necessary when creating or editing pages to make sure
        // everything is in sync
        keys.forEach(_key => redisClient.del(_key))
    })
}


const filterSettingsForUser = (collection: any[], request: Request, response: Response) => {

    const authRole = request.user.role_id

    const filteredSettings = collection.filter(_set => {

        // Master Admin can see all system settings
        if (authRole === 0) return true

        return (_set.allowed_roles.includes(request.user.role_id) || request.user.role_id <= 1)
    })

    response.send(filteredSettings)

    // Cache query result to redis
    CacheQueryResult(request, filteredSettings)
}


const cleanUserByRole = (collection: any[], request: Request, response: Response) => {

    let filteredUsers = collection.map(_user => {

        if (request.user.role_id > 2) {

            _user = {
                ..._user,
                last_login: undefined,
                updated_at: undefined,
                created_at: undefined,
                deleted_at: undefined,
                role_id: undefined,
                status: undefined
            }
        }

        _user.__v = undefined

        return _user
    })


    // If not MASTER admin
    if (request.user.role_id > 0) {
        // Remove master admin from request if the authenticated user requesting
        // is not the master himself
        filteredUsers = filteredUsers.filter(_user => _user.role_id !== 0)
    }

    const ownAccount = filteredUsers.find(_user => _user._id === request.user._id)

    filteredUsers = filteredUsers.filter(_user => _user._id !== request.user._id)

    // Append own user account to the first element
    if (ownAccount) filteredUsers = [].concat(ownAccount, filteredUsers)

    response.send(filteredUsers)

    // Cache query result to redis
    CacheQueryResult(request, filteredUsers)
}


// api/v1/blog/posts
// get => getBlogPosts
export const DynamicRoutes: DynamicRouteSchema[] = [
    {
        route: 'blog',
        children: [
            {
                route: 'posts',
                model: BlogPostModel,
                methods: [
                    {method: 'index'},
                    {method: 'get'},
                    {method: 'create'},
                    {method: 'update'}
                ]
            }
        ]
    },
    {
        route: 'website',
        children: [
            {
                route: 'pages',
                model: WebsitePageModel,
                methods: [
                    {method: 'index'},
                    {method: 'get'},
                    {method: 'create', hook: deletePageCache, role_id: [1, 2, 3, 5]},
                    {method: 'update', hook: deletePageCache, role_id: [1, 2, 3, 5]},
                ]
            }
        ]
    },
    {
        route: 'system',
        children: [
            {
                route: 'users',
                model: SystemUserModel,
                methods: [
                    {
                        method: 'index',
                        query: {
                            sort: {
                                status: -1,
                                role_id: -1
                            }
                        },
                        filter: cleanUserByRole
                    },
                    {method: 'get', role_id: [1, 2, 5]},
                ]
            },
            {
                route: 'settings',
                model: SystemSettingsModel,
                methods: [
                    {
                        method: 'index',
                        query: {
                            sort: {
                                order: 1
                            }
                        },
                        filter: filterSettingsForUser
                    },
                    {method: 'update', hook: deletePageCache},
                ]
            }
        ]
    }
]
