export enum StoreKeys {
    // Which menu us currently active in the sidebar
    Whatever = 1
}

// Generate string store key address for use with localStorage
export function StoreKeyAddress(key: StoreKeys): string {
    return 'store_key_' + key
}
