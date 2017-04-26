import {Model} from 'mongoose'
import {
    BlogPostModel,
    WebsitePageModel,
} from '../../../@stellium-database'
import {DeletePageCache} from '../resource_cache'


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
     * function DeletePageCache() {
     *     redis.flushAll()
     * }
     *
     * ...route config:
     * {
     *     method: 'create',
     *     hook: DeletePageCache,
     *     role_id: 1
     * }
     *
     * The `DeletePageCache` function will be executed when the page has been store to the database
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
                    {
                        method: 'index'
                    },
                    {
                        method: 'get'
                    },
                    {
                        method: 'create'
                    },
                    {
                        method: 'update',
                        hook: DeletePageCache,
                    }
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
                    {
                        method: 'index'
                    },
                    {
                        method: 'get'
                    },
                    // {method: 'create', hook: DeletePageCache, role_id: [1, 2, 3, 5]},
                    {
                        method: 'update',
                        hook: DeletePageCache,
                        role_id: [1, 2, 3, 5]
                    }
                ]
            }
        ]
    }
]
