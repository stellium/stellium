export interface SystemSettingsSchema {
    _id?: string
    key: string
    value: string
    title: string
    description: string
    order: number
    allowed_roles: number[]
    created_at: Date
    updated_at: Date
    cache_dependencies: string[]
    locked: boolean
    messages: {
        match: string,
        value: any,
        color: string,
        description: string
    }[],
}
