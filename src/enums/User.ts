export enum OperationError {
    INTERNAL_ERROR = "OperationError.INTERNAL_ERROR"
}

export enum SuperAdminCreationResult {
    INVALID_DATA = "invalidDataProvided",
    INVALID_CREATION = "invalidCreationDetected",
    USER_ALREADY_EXISTS = "userAlreadyExist",
    SUCCESS = "created"
}

export enum SuperAdminUpdateResult {
    INVALID_DATA = "invalidDataProvided",
    SUCCESS = "updated",
    USER_NOT_FOUND = "userNotFound"
}

export enum AdminCreationResult {
    INVALID_DATA = "invalidDataProvided",
    INVALID_CREATION = "invalidCreationDetected",
    USER_ALREADY_EXISTS = "userAlreadyExist",
    SUCCESS = "created"
}

export enum AdminUpdateResult {
    INVALID_DATA = "invalidDataProvided",
    INVALID_CREATION = "invalidCreationDetected",
    USER_ALREADY_EXISTS = "userAlreadyExist",
    SUCCESS = "updated",
    USER_NOT_FOUND = "userNotFound"
}

export enum AdminRemoveResult {
    INVALID_DATA = "invalidDataProvided",
    SUCCESS_LOGICAL = "userLogicallyRemoved",
    SUCCESS_PHYSICAL = "userPhysicallyRemoved",
    SUCCESS = "deleted",
    USER_NOT_FOUND = "userNotFound"
}

export enum AdminRestoreResult {
    INVALID_DATA = "invalidDataProvided",
    SUCCESS_LOGICAL = "userLogicallyRestored",
    SUCCESS_PHYSICAL = "userPhysicallyRestored",
    SUCCESS = "restored",
    USER_NOT_FOUND = "userNotFound"
}

export enum ClientCreationResult {
    INVALID_DATA = "invalidDataProvided",
    INVALID_CREATION = "invalidCreationDetected",
    USER_ALREADY_EXISTS = "userAlreadyExist",
    SUCCESS = "created"
}

export enum PaymentAddResult {
    INVALID_DATA = "invalidDataProvided",
    INVALID_CREATION = "invalidCreationDetected",
    CURRENCY_DOES_NOT_EXIST = "currencyDoesNotExist",
    USER_NOT_FOUND = "userNotFound",
    SUCCESS = "created"
}

export enum ClientUpdateResult {
    INVALID_DATA = "invalidDataProvided",
    INVALID_CREATION = "invalidDataNoted",
    USER_NOT_FOUND = "userNotFound",
    SAME_DOCUMENT_ALREADY_EXISTS = "sameDocumentAlreadyExists",
    SUCCESS = "updated"
}

export enum ClientRemoveResult {
    INVALID_DATA = "invalidDataProvided",
    SUCCESS_LOGICAL = "userLogicallyRemoved",
    SUCCESS_PHYSICAL = "userPhysicallyRemoved",
    SUCCESS = "deleted",
    USER_NOT_FOUND = "userNotFound"
}

export enum ClientRestoreResult {
    INVALID_DATA = "invalidDataProvided",
    SUCCESS_LOGICAL = "userLogicallyRestored",
    SUCCESS_PHYSICAL = "userPhysicallyRestored",
    SUCCESS = "restored",
    USER_NOT_FOUND = "userNotFound"
}

export enum ValidPayloadCodes {
    VALID_PAYLOAD
}

export enum LogInResult {
    INVALID_PASSWORD = "InvalidPassword",
    INVALID_DATA = "InvalidLoginData",
    SUCCESS = "loggedIn",
    INTERNAL_ERROR = "logInInternalError",
    USER_DOES_NOT_EXIST = "userDoesNotExist",
    USER_NOT_ACTIVE = "userIsNotActive"
}

export enum LogOutResult {
    INTERNAL_ERROR = "internalError",
    SUCCESS = "loggedOut",
    INVALID_TOKEN_PROVIDED = "invalidTokenProvided"
}

export enum RoleUpdateResult {
    INTERNAL_ERROR = "internalError",
    SUCCESS = "changedRole",
    INVALID_DATA = "invalidDataprovided",
}

export enum ClientStatus {
    DELETED = 0,
    ACTIVE = 1,
    SUSPENDED = 2
}

export enum SuperAdminStatus {
    DELETED = 0,
    ACTIVE = 1,
    SUSPENDED = 2
}

export enum AdminStatus {
    DELETED = 0,
    ACTIVE = 1,
    SUSPENDED = 2
}

export enum UserSearchResultMode {
    RAW_AND_ENTITIES = 0,
    RAW = 1,
    ENTITIES = 2
}

export enum USER_SERVICE_EVENTS {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    PROFILE_LOADED = "PROFILE_LOADED",
    ADMIN_CREATED = "ADMIN_CREATED",
    CLIENT_CREATED = "CLIENT_CREATED",
    CLIENT_DESINCORPORATED = "CLIENT_DESINCORPORATED",
    CLIENT_RESTORED = "CLIENT_RESTORED",
    SOCKET_REQUEST_ERROR = "SOCKET_REQUEST_ERROR",
    SUPER_ADMIN_CREATED = "SUPER_ADMIN_CREATED",
    CLIENT_UPDATED = "CLIENT_UPDATED",
    ADMIN_UPDATED = "ADMIN_UPDATED",
    ADMIN_ROLE_UPDATED = "ADMIN_ROLE_UPDATED",
    ADMIN_REMOVED = "ADMIN_REMOVED",
    ADMIN_RESTORED = "ADMIN_RESTORED"
}