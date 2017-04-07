import {WebsitePageSchema} from '../@stellium-common'


export interface CommonPageData {
    meta?: any
    locals?: any
    shoppingCartItem?: any[]
    cartTotal?: number
    cache?: boolean
    page?: WebsitePageSchema | any
    theme_variables?: any
    dynamicContent?: boolean
}
