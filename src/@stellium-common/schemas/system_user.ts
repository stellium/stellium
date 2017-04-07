export interface SystemUserSchema {
    _id?: string;
    first_name?: string;
    last_name?: string;
    image?: string;
    email?: string;
    username?: string;
    password?: string;
    role_id?: number;
    status?: boolean;
    last_login?: Date | number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
