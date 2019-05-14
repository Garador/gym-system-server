export enum LoginStatus {
    DELETED = 0,
    ACTIVE = 1,
    SUSPENDED = 2
}

export enum LoginCommands {
    UPDATE_SUPER_ADMIN = "update_super_admin",
    CREATE_SUPER_ADMIN = "create_super_admin"
}