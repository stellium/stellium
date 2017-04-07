/**
 * Keys to reserved URLs that cannot be used or overridden by users
 */
export enum ReservedPageKeys {
    Products = 0,
    ProductDetail = 1,
    PostOrder = 2,
    AddToCart = 3,
    ShoppingCart = 4,
    Checkout = 5,
    CheckoutComplete = 6,
    Blog = 7,
}


const translatableRoutes = [
    {
        key: ReservedPageKeys.Products,
        values: {
            en: 'products',
            id: 'produk'
        },
        description: '`products` is an internally reserved URL. You cannot use products as your pages URL as it is used to show a list of available products saved in the database. You can manage products by going into the ecommerce menu to manage products'
    },
    {
        key: ReservedPageKeys.ProductDetail,
        values: {
            en: 'product-detail',
            id: 'detail-produk'
        }
    },
    {
        key: ReservedPageKeys.PostOrder,
        values: {
            en: 'post-order',
            id: 'pembayaran'
        }
    },
    {
        key: ReservedPageKeys.AddToCart,
        values: {
            en: 'add-to-cart',
            id: 'tambahkan-ke-keranjang'
        }
    },
    {
        key: ReservedPageKeys.Checkout,
        values: {
            en: 'checkout',
            id: 'pembayaran'
        }
    },
    {
        key: ReservedPageKeys.ShoppingCart,
        values: {
            en: 'shopping-cart',
            id: 'keranjang-belanja'
        }
    },
    {
        key: ReservedPageKeys.CheckoutComplete,
        values: {
            en: 'checkout-complete',
            id: 'pembayaran-berhasil'
        }
    },
    {
        key: ReservedPageKeys.Blog,
        values: {
            en: 'blog',
            id: 'blog'
        }
    }
];

export const URLTranslator = (lang: string) => (urlKey: ReservedPageKeys): string => {

    const route = translatableRoutes.find(_route => _route.key === urlKey);

    return route.values[lang];
};
