export enum LogActions {
    super_admin_creation = 1,
    super_admin_update = 10,

    auth_login = 11,
    auth_logout = 12,
    auth_changed_password = 19,

    admin_add = 20,
    admin_update = 21,
    admin_delete = 22,
    admin_search = 23,

    data_export = 30,
    data_import = 31,

    client_incorporate = 40,
    client_update = 41,
    client_desincorporate = 42,
    client_search = 43,

    payment_add = 60,
    payment_search = 61,
    payment_update = 62,
    payment_delete = 63,
    
    role_update = 64
}

export enum LogCreationResult {
    INVALID_DATA = "invalidDataProvided",
    INVALID_CREATION = "invalidCreationDetected",
    INTERNAL_ERROR = "internalError",
    SUCCESS = "created",
    NOT_ALLOWED = "logNotAllowed"
}


export enum LogResultMode {
    RAW_AND_ENTITIES = 1,
    RAW = 2,
    ENTITIES = 3
}