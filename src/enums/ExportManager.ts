export enum ExportResultCode {
    SUCCESS = "successExportingToZip",
    ERROR_RENAMING_FILES = "errorRenamingFiles",
    ERROR_GENERATING_FILES = "errorGeneratingFiles",
    ERROR_GENERATING_ZIP = "errorGeneratingZip",
    FILES_NOT_GENERATED = "filesNotGenerated"
}

export enum ImportResultCode {
    SUCCESS = "successImportingFromZip",
    PLATFORM_NOT_SUPPORTED = "platformNotSupported",
    ZIP_DOES_NOT_EXIST = "zipDoesntExist",
    ZIP_READING_ERROR = "zipReadingError",
    ZIP_NAME_ERROR = "invalidZipNameError",
    DB_TEST_RESTORE_ERROR = "errorRestoringToTestDB",
    DB_TEST_CREATION_ERROR = "errorCreatingTestDatabases",
    DB_TEST_INTEGRITY_CHECK_ERROR = "errorCreatingTestDatabases",
    DB_TEST_CONNECTION_ERROR = "errorConnectingToDatabases",
    DB_TEST_FIELD_COUNT_ERROR = "testDatabaseRecordsNotComplete",
    DB_BACKUP_FILE_GENERATION_ERROR = "failedToGenerateCurrentDBBackupFile",
}


export enum BACKUP_SERVICE_EVENTS {
    DATABASE_RESTORED = "DATABASE_RESTORED"
}