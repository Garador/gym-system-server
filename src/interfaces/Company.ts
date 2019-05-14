import { IValidateCompanyPayloadResult } from "./SyntaxValidationProvider";
import { CompanyUpdateResult } from "../enums/Company";

export interface ICompanyUpdatePayload {
    name ? : string,
    description ? : string
}


export interface ICompanyUpdateResult {
    updated: boolean,
    message: IValidateCompanyPayloadResult,
    result: CompanyUpdateResult | Error
}


export interface ICompanyUpdateResult {
    updated: boolean,
        message: IValidateCompanyPayloadResult,
        result: CompanyUpdateResult | Error
}