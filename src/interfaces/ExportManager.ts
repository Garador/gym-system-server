import { ExportResultCode, ImportResultCode } from "../enums/ExportManager";

export interface IExportResult {
    result: ExportResultCode,
    data: any,
    outputFileLocation: string | null
}

export interface IImportResult {
    result: ImportResultCode,
    data: any,
    outputFileLocation: string | null
}

export interface IFileUpload {
    files:object[],
    fileNames:string[]
}

export interface IFileUploadResult {
    filePaths: string[],
    importResult:IImportResult
}

export interface IParseRecordData {
    ci: string,
    phone: string,
    name: string,
    surName: string,
    ammount: string,
    address: string,
    inscription_day: string,
    inscription_month: string,
    inscription_year: string,
    due_date_day: string,
    due_date_month: string,
    due_date_year: string
}

export interface ImportFolderResult {
    files:number,
    records:number
}

export interface ExportOperationLoggingLevel {
    a?: number,
    b?: number,
    c?: number
}