import {ValidPayloadCodes} from '../enums/User';
import {SyntaxErrorCodes} from '../enums/SyntaxValidationProvider';
export interface IValidateSuperAdminPayloadResult {
    valid:boolean,
    code:SyntaxErrorCodes | ValidPayloadCodes
}

export interface IValidateSuperAdminUpdatePayloadResult {
    valid:boolean,
    code:SyntaxErrorCodes | ValidPayloadCodes
}

export interface IValidateAdminPayloadResult {
    valid:boolean,
    code:SyntaxErrorCodes | ValidPayloadCodes
}

export interface IValidateAdminUpdatePayloadResult {
    valid:boolean,
    code:SyntaxErrorCodes | ValidPayloadCodes
}

export interface IValidateClientCreationPayloadResult {
    valid:boolean,
    code:SyntaxErrorCodes | ValidPayloadCodes
}

export interface IValidatePaymentAddPayloadResult {
    valid:boolean,
    code:SyntaxErrorCodes | ValidPayloadCodes
}

export interface IValidateLogCreationPayloadResult {
    valid:boolean,
    code:SyntaxErrorCodes | ValidPayloadCodes
}

export interface IValidateRoleUpdatePayloadResult {
    valid:boolean,
    code:SyntaxErrorCodes | ValidPayloadCodes
}

export interface IValidateCompanyPayloadResult {
    valid:boolean,
    code:SyntaxErrorCodes | ValidPayloadCodes
}

export interface IValidateCompanyPayloadResult {
    valid:boolean,
    code:SyntaxErrorCodes | ValidPayloadCodes
}