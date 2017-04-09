import {WebsitePageSchema} from '../@stellium-common'


export interface CommonPageData {
    meta?: any
    locals?: any
    shoppingCartItem?: any[]
    cartTotal?: number
    cache?: boolean
    // Must provide
    page?: WebsitePageSchema | any
    theme_variables?: any
    // Must provide
    dynamicContent?: boolean
}
