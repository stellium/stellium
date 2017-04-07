export interface SystemUserGroupSchema {
    _id?: string;
    role_id: number;
    group: string;
    info: string;
    users: SystemUserGroupSchema[];
    created_at?: Date;
    updated_at?: Date;
}
