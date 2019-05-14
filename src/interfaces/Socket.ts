import { ISuperAdminCreationPayload, ISuperAdminCreationResult, ILogInResult, ILogOutResult, ISuperAdminUpdatePayload, ISuperAdminUpdateResult, IAdminCreationPayload, IAdminCreationResult, IAdminUpdatePayload, IAdminUpdateResult, IRoleUpdateResult, IRoleUpdatePayload, IAdminRemovePayload, IAdminRemoveResult, IAdminRestoreResult, IAdminRestorePayload, IClientCreationPayload, IClientCreationResult, IClientUpdatePayload, IClientUpdateResult, IClientRemoveResult, IClientRemovePayload, IClientRestorePayload, IClientRestoreResult, IPaymentAddPayload, IPaymentAddResult, IUserSearchOptions } from "./User";
import { SOCKET_REQUEST_ERROR } from "../enums/Socket";
import { UserSearchResultMode } from "../enums/User";
import { User } from "../models/User";
import {PaymentResultMode} from '../enums/Payment';
import { IPaymentSearchOption } from "./Payment";
import { IExportResult, IImportResult, IFileUpload, IFileUploadResult } from "./ExportManager";
import { ICompanyUpdateResult, ICompanyUpdatePayload } from "./Company";
import { PAYMENT_METHODS } from "../enums/PaymentMethods";
import { DOCUMENT_PREFIXES } from "../base/DocumentPrefixes";
import { ILogSearchOptions } from "./Log";
import { LogResultMode } from "../enums/Log";
import { Role } from '../models/Role';

export namespace IRequests {

    export interface AuthPayload {
        jwt?:string,
        login?:{
            username: string,
            password: string
        }
    }
    export interface _BASE_REQUEST_PAYLOAD {
        _meta:MetaPayload
        ,payload:any
    }

    export interface MetaPayload {
        _id:number,
        _auth?: AuthPayload
    }

    export interface UserSearch {
        _meta:MetaPayload
        payload:{
            content:IUserSearchOptions
            ,resultMode: UserSearchResultMode
        }
    }

    export interface UserSearchSuccessfullResponse {
        content: any
        ,resultMode: UserSearchResultMode
    }

    export interface UserSearchResponse {
        _meta:MetaPayload
        payload:SOCKET_REQUEST_ERROR | UserSearchSuccessfullResponse
    }

    export namespace SuperAdmin {

        //Super-admin requests
        export interface Creation{
            _meta:MetaPayload
            payload:{
                content:ISuperAdminCreationPayload
            }
        }

        export interface CreationResponse {
            _meta:MetaPayload
            ,payload:{
                content:ISuperAdminCreationResult
            }
        }

        export interface Update{
            _meta:MetaPayload
            ,payload: ISuperAdminUpdatePayload
        }

        export interface UpdateResponse {
            _meta:MetaPayload
            ,payload: ISuperAdminUpdateResult | SOCKET_REQUEST_ERROR
        }
    }

    export namespace Admin {

        export interface Creation{
            _meta:MetaPayload
            payload:{
                content:IAdminCreationPayload
            }
        }

        export interface CreationResponse {
            _meta:MetaPayload
            ,payload:{
                content:IAdminCreationResult | SOCKET_REQUEST_ERROR
            }
        }

        export interface Update{
            _meta:MetaPayload
            ,payload: {
                id: number,
                content: IAdminUpdatePayload
            }
        }

        export interface UpdateRole{
            _meta:MetaPayload
            ,payload: {
                id: number,
                content: IRoleUpdatePayload
            }
        }

        export interface UpdateResponse {
            _meta:MetaPayload
            ,payload: IAdminUpdateResult | SOCKET_REQUEST_ERROR | IRoleUpdateResult
        }

        export interface Remove{
            _meta:MetaPayload
            payload:IAdminRemovePayload
        }

        export interface RemoveResponse {
            _meta:MetaPayload
            ,payload:IAdminRemoveResult | SOCKET_REQUEST_ERROR
        }

        export interface Restore{
            _meta:MetaPayload
            payload:IAdminRestorePayload
        }

        export interface RestoreResponse {
            _meta:MetaPayload
            ,payload:IAdminRestoreResult | SOCKET_REQUEST_ERROR
        }
    }

    export namespace Payment {

        export interface Creation {
            _meta:MetaPayload
            payload:{
                id: number,     //ID del cliente
                content:IPaymentAddPayload
            }
        }

        export interface CreationResponse {
            _meta: MetaPayload
            ,payload: IPaymentAddResult | SOCKET_REQUEST_ERROR
        }


        export interface Search {
            _meta:MetaPayload
            payload:{
                content: IPaymentSearchOption
                ,resultMode: PaymentResultMode
            }
        }

        export interface SearchSuccessfullResponse {
            content: any
            ,resultMode: PaymentResultMode
        }

        export interface SearchResponse {
            _meta:MetaPayload
            payload:SOCKET_REQUEST_ERROR | SearchSuccessfullResponse
        }
    }

    export namespace Client {

        export interface Creation{
            _meta:MetaPayload
            payload:{
                content:IClientCreationPayload
            }
        }

        export interface CreationResponse {
            _meta:MetaPayload
            ,payload:{
                content:IClientCreationResult | SOCKET_REQUEST_ERROR
            }
        }

        export interface Update{
            _meta:MetaPayload
            ,payload: {
                id: number,
                content: IClientUpdatePayload
            }
        }

        export interface UpdateResponse {
            _meta:MetaPayload
            ,payload: IClientUpdateResult | SOCKET_REQUEST_ERROR | IRoleUpdateResult
        }

        export interface Remove{
            _meta:MetaPayload
            payload:IClientRemovePayload
        }

        export interface RemoveResponse {
            _meta:MetaPayload
            ,payload:IClientRemoveResult | SOCKET_REQUEST_ERROR
        }

        export interface Restore{
            _meta:MetaPayload
            payload:IClientRestorePayload
        }

        export interface RestoreResponse {
            _meta:MetaPayload
            ,payload:IClientRestoreResult | SOCKET_REQUEST_ERROR
        }
    }

    export namespace Company {

        export interface Update {
            _meta:MetaPayload
            ,payload: ICompanyUpdatePayload
        }

        export interface UpdateResponse {
            _meta:MetaPayload
            ,payload: ICompanyUpdateResult | SOCKET_REQUEST_ERROR
        }

        export interface Get {
            _meta:MetaPayload
        }

        export interface GetResponse {
            _meta:MetaPayload
            ,payload: toJson.ICompany | SOCKET_REQUEST_ERROR
        }
    }

    export namespace PaymentMethods {

        export interface Get {
            _meta:MetaPayload
        }

        export interface GetResponse {
            _meta:MetaPayload
            ,payload: {
                [index:string]: PAYMENT_METHODS
            } | SOCKET_REQUEST_ERROR
        }
    }

    export namespace DocumentTypes {

        export interface Get {
            _meta:MetaPayload
        }

        export interface GetResponse {
            _meta:MetaPayload
            ,payload: {
                [index:string]: DOCUMENT_PREFIXES
            } | SOCKET_REQUEST_ERROR
        }
    }

    export namespace BaseRoles {

        export interface Get {
            _meta:MetaPayload
        }

        export interface GetResponse {
            _meta:MetaPayload
            ,payload: toJson.IBaseRole[] | SOCKET_REQUEST_ERROR
        }
    }

    export namespace Logs {

        export interface Get {
            _meta:MetaPayload,
            payload:{
                searchOptions: ILogSearchOptions,
                resultMode: LogResultMode
            }
        }

        export interface GetResponse {
            _meta:MetaPayload
            ,payload: toJson.ILog[] | SOCKET_REQUEST_ERROR | any
        }
    }

    export namespace Currency {

        export interface Get {
            _meta:MetaPayload
        }

        export interface GetResponse {
            _meta:MetaPayload
            ,payload: toJson.ICurrency[] | SOCKET_REQUEST_ERROR
        }
    }

    export namespace Auth {
        //Auth requests
        export interface LogIn {
            _meta:MetaPayload
        }

        export interface LogInResponse {
            _meta:MetaPayload
            ,payload:ILogInResult
        }

        export interface LogOut {
            _meta:MetaPayload
        }

        export interface LogOutResponse {
            _meta:MetaPayload
            ,payload:ILogOutResult
        }
    }

    export interface Ping {
        _meta:MetaPayload
        payload:{
            content:any
        }
    }
    
    export namespace Data {

        export interface Export{
            _meta:MetaPayload
        }

        export interface ExportResponse {
            _meta:MetaPayload
            ,payload:IExportResult | SOCKET_REQUEST_ERROR
        }


        export interface Import{
            _meta:MetaPayload
            ,payload:{
                file:string
            }
        }

        export interface ImportResponse {
            _meta:MetaPayload
            ,payload:IImportResult | SOCKET_REQUEST_ERROR
        }

        export interface ExportList{
            _meta:MetaPayload
        }

        export interface ExportListResponse {
            _meta:MetaPayload
            ,payload:string[] | SOCKET_REQUEST_ERROR
        }

        export interface ExportRemove{
            _meta:MetaPayload
            ,payload:{
                fileName:string
            }
        }

        export interface ExportRemoveResponse {
            _meta:MetaPayload
            ,payload:boolean | SOCKET_REQUEST_ERROR
        }

        export interface ImportFileUpload {
            _meta:MetaPayload
            ,payload: IFileUpload
        }

        export interface ImportFileUploadResponse {
            _meta:MetaPayload
            ,payload: IFileUploadResult | SOCKET_REQUEST_ERROR
        }
    }
}


export namespace toJson {

    export interface IDocument {
        id: number,
        createdAt: Date,
        updatedAt: Date,
        status: number,
        prefix: string,
        content: string,
        image: string,
        user: IUser | number |  null
    }

    export interface ILogin {
        id: number,
        updatedAt: Date,
        createdAt: Date,
        status: number,
        username: string,
        salt?: string,
        hash?: string,
        algorithm?: string,
        user: number | null
    }

    export interface IMembership {
        id: number,
        updatedAt: Date,
        createdAt: Date,
        status: number,
        cutDate: Date,
        inscriptionDate: Date,
        company: number | null,
        monthAmmount: number | null;
        user: number | null
    }

    export interface IUser {
        id: number,
        updatedAt: Date,
        createdAt: Date,
        status: number,
        firstName: string,
        surName: string,
        address: string,
        phone: string,
        document: IDocument | number,
        login: ILogin | number,
        membership: IMembership | number,
        role: IRole | number
    }

    export interface IJwt {
        id: number,
        updatedAt: Date,
        createdAt: Date,
        status: number,
        token: string,
        user: IUser | number | null
        ,expireAt?: Date
    }

    export interface ILog {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: number;
        action: number;
        actionTime: Date;
        user: IUser | number;
        content?:ILogcontent
    }

    export interface ILogcontent {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        logId: number;
        status: number;
        previousValue: string;
        newValue: string;
    }

    export interface IPayment {
        id: number,
        updatedAt: Date,
        createdAt: Date,
        status: number,
        ammount: number,
        paymentMethod: number,
        notes: string,
        currency: string | ICurrency,
        membership: IMembership | number,
    }

    export interface IRole {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: number;
        canLogin: boolean;
        canChangePassword: boolean;
        canAddAdmin: boolean;
        canUpdateAdmin: boolean;
        canRemoveAdmin: boolean;
        canSearchAdmin: boolean;
        canExportData: boolean;
        canImportData: boolean;
        canIncorporateClient: boolean;
        canUpdateClient: boolean;
        canDesincorporateClient: boolean;
        canSearchClient: boolean;
        canAddPayment: boolean;
        canUpdatePayment: boolean;
        canRemovePayment: boolean;
        canSearchPayment: boolean;
        canUpdateUserRoles: boolean;
        user: IUser | number | null;
        baseRole: IUser | number | null;
    }

    export interface IBaseRole {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: number;
        version: number;
        name: string;
        canLogin: boolean;
        canChangePassword: boolean;
        canAddAdmin: boolean;
        canUpdateAdmin: boolean;
        canRemoveAdmin: boolean;
        canSearchAdmin: boolean;
        canExportData: boolean;
        canImportData: boolean;
        canIncorporateClient: boolean;
        canUpdateClient: boolean;
        canDesincorporateClient: boolean;
        canSearchClient: boolean;
        canAddPayment: boolean;
        canUpdatePayment: boolean;
        canRemovePayment: boolean;
        canSearchPayment: boolean;
        canUpdateUserRoles: boolean;
    }

    export interface ICompany {
        id: number,
        updatedAt: Date,
        createdAt: Date,
        status: number,
        description: string,
        name: string,
        memberships: toJson.IMembership[] | number[]
    }

    export interface ICurrency {
        id: string,
        updatedAt: Date,
        createdAt: Date,
        status: number,
        isoCode: number,
        decimals: number,
        displayName: string,
        payments: number[] | toJson.IPayment[]
    }
}