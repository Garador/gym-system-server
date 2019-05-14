import {
    User
} from "../models/User";
import {
    IValidateSuperAdminPayloadResult,
    IValidateAdminPayloadResult,
    IValidateClientCreationPayloadResult,
    IValidateSuperAdminUpdatePayloadResult,
    IValidateAdminUpdatePayloadResult,
    IValidatePaymentAddPayloadResult,
    IValidateRoleUpdatePayloadResult
} from './SyntaxValidationProvider';
import {
    ITokenInterface
} from "../interfaces/PasswordManager";
import {
    LogInResult,
    LogOutResult,
    ClientCreationResult,
    AdminCreationResult,
    SuperAdminCreationResult,
    ClientUpdateResult,
    PaymentAddResult,
    RoleUpdateResult,
    OperationError,
    AdminUpdateResult,
    AdminRemoveResult,
    ClientRemoveResult,
    ClientRestoreResult,
    AdminRestoreResult,
    SuperAdminUpdateResult
} from '../enums/User';
import {
    DOCUMENT_PREFIXES
} from "../base/DocumentPrefixes";
import {
    Payment
} from "../models/Payment";
import {
    PAYMENT_METHODS
} from "../enums/PaymentMethods";
import {
    DocumentStatus
} from "../enums/Document";
import { Jwt } from '../models/Jwt';
import { Role } from '../models/Role';
import { toJson } from "./Socket";

export interface IAuthPayload {
    token: string
}
//SuperAdmin:
export interface ISuperAdminCreationPayload {
    username: string,
        password: string,
        firstName: string,
        surName: string,
        address: string,
        phone:string,
        document?: {
            prefix : DOCUMENT_PREFIXES,
            content : string,
            image ? : string
        }
}

export interface ISuperAdminCreationResult {
    created: boolean,
        message: IValidateSuperAdminPayloadResult,
        result: SuperAdminCreationResult | OperationError
    user ? : User
}

export interface ISuperAdminUpdatePayload {
    password ? : string,
        username ? : string,
        firstName ? : string,
        surName ? : string,
        address ? : string,
        phone ? : string
}

export interface ISuperAdminUpdateResult {
    updated: boolean,
    message: IValidateSuperAdminPayloadResult,
    result: SuperAdminUpdateResult | OperationError
}

//Admins:
export interface IAdminCreationPayload {
    username: string,
    password: string,
    firstName: string,
    surName: string,
    phone:string,
    address:string,
    document?: {
        prefix : DOCUMENT_PREFIXES,
        content : string,
        image ? : string
    }
}

export interface IAdminRemovePayload {
    id: number
}

export interface IAdminRestorePayload {
    id: number
}

export interface IAdminCreationResult {
    created: boolean,
    message: IValidateAdminPayloadResult,
    result: AdminCreationResult | OperationError,
    user: User | null
}

export interface IAdminUpdatePayload {
    password ? : string,
    username ? : string,
    firstName ? : string,
    surName ? : string,
    address ? : string,
    phone ? : string,
    document ? : {
        prefix ? : DOCUMENT_PREFIXES,
        content ? : string,
        image ? : string
    }
}

export interface IAdminUpdateResult {
    updated: boolean,
    message: IValidateAdminUpdatePayloadResult | string,
    result: AdminUpdateResult | OperationError
}

export interface IAdminRemoveResult {
    removed: boolean,
    message ? : Error | string | User,
    result ? : AdminRemoveResult | OperationError
}

export interface IAdminRestoreResult {
    restored: boolean,
    message ? : Error | string | User,
    result ? : AdminRestoreResult | OperationError
}

//Clients:
export interface IClientCreationPayload {
    firstName: string,
        surName: string,
        address: string,
        phone:string,
        document: {
            prefix: DOCUMENT_PREFIXES,
            content: string,
            image: string | null
        },
        membership: {
            cutDate: number,
            monthAmmount:number,
            inscriptionDate: number
        }
}

export interface IClientCreationResult {
    created: boolean,
    message: IValidateClientCreationPayloadResult,
    result: ClientCreationResult | OperationError,
    user: User | null
}

export interface IClientUpdatePayload {
    firstName ? : string,
        surName ? : string,
        address ? : string,
        phone ? : string,
        document ? : {
            prefix ? : DOCUMENT_PREFIXES,
            content ? : string,
            image ? : string | null
        },
        membership ? : {
            cutDate ? : number,
            monthAmmount?: number,
            inscriptionDate ? : number
        }
}

export interface IClientUpdateResult {
    updated: boolean,
        message: IValidateClientCreationPayloadResult,
        result: ClientUpdateResult | OperationError
}

export interface IClientRemoveResult {
    removed: boolean,
        message ? : Error | string | User,
        result ? : ClientRemoveResult | OperationError
}

export interface IClientRestoreResult {
    restored: boolean,
    message ? : Error | string | User,
    result ? : ClientRestoreResult | OperationError
}

export interface IClientRemovePayload {
    id: number
}

export interface IClientRestorePayload {
    id: number
}

//Payments:
export interface IPaymentAddPayload {
    payment: {
            ammount: number,
            currency: string, //Currency ID
            method: PAYMENT_METHODS,
            notes: string
        },
        membership ? : {
            monthAmmount?: number,
            cutDate?: number
        }
}

export interface IPaymentAddResult {
    created: boolean,
        message: IValidatePaymentAddPayloadResult,
        result: PaymentAddResult | OperationError,
        payment: Payment | null
}

//LogIn:
export interface ILogInResult {
    logIn: boolean,
        code: LogInResult,
        data: ITokenInterface | null
}

export interface ILogOutResult {
    logOut: boolean
    code: LogOutResult,
        data: Object | null
}

//Role
export interface IRoleUpdatePayload {
    role: {
        [index: string]: boolean,
        canAddAdmin ? : boolean,
        canAddPayment ? : boolean,
        canChangePassword ? : boolean,
        canDesincorporateClient ? : boolean,
        canExportData ? : boolean,
        canImportData ? : boolean,
        canIncorporateClient ? : boolean,
        canLogin ? : boolean,
        canRemoveAdmin ? : boolean,
        canRemovePayment ? : boolean,
        canSearchAdmin ? : boolean,
        canSearchClient ? : boolean,
        canSearchPayment ? : boolean,
        canUpdateAdmin ? : boolean,
        canUpdateClient ? : boolean,
        canUpdatePayment ? : boolean,
        canUpdateUserRoles ? : boolean,
    }
}


export interface IRoleUpdateResult {
    updated: boolean,
        message: IValidateRoleUpdatePayloadResult,
        result: RoleUpdateResult | OperationError
}








export interface IMetadataSearchOptions {
    id ? : boolean | {
        equal: number
    },
    createdAt ? : boolean | {
        greater?: Date,
        lesser?: Date
    },
    updatedAt ? : boolean | {
        greater ? : Date,
        lesser ? : Date
    },
    status ? : boolean | {
        equal: DocumentStatus
    }, __ord?: 'asc' | 'desc'
}


export interface IUserSearchOptions {
    where: {
            user ? : {
                meta ? : IMetadataSearchOptions,
                content ? : {
                    surname ? : {
                        like ? : string,
                        equal ? : string
                    },
                    name ? : {
                        like ? : string,
                        equal ? : string
                    },
                    address ? : {
                        like ? : string,
                        equal ? : string
                    },
                    phone ? : {
                        like ? : string,
                        equal ? : string
                    }
                }
            },
            document ? : {
                meta ? : IMetadataSearchOptions,
                content ? : {
                    prefix ? : {
                        equal: DOCUMENT_PREFIXES
                    },
                    content ? : {
                        like ? : string,
                        equal ? : string
                    }
                }
            },
            membership?: {
                meta ? : IMetadataSearchOptions,
                content ? : {
                    cut_date ? : {
                        greater ? : Date,
                        lesser ? : Date
                    },
                    inscription_date ? : {
                        greater ? : Date,
                        lesser ? : Date
                    },
                    month_ammount ? : {
                        greater ? : number,
                        lesser ? : number
                    },
                    company ? : {
                        equal: number
                    }
                }
            },
            login?: {
                meta ? : IMetadataSearchOptions,
                content ? : {
                    username ? : {
                        like ? : string,
                        equal ? : string
                    }
                }
            },
            jwt?: {
                meta ? : IMetadataSearchOptions,
                content ? : {
                    token ? : {
                        like ? : string,
                        equal ? : string
                    }
                }
            },
            role?: {
                meta ? : IMetadataSearchOptions,
                content ? : {
                    canLogin ? : {
                        equal: boolean
                    },
                    canChangePassword ? : {
                        equal: boolean
                    },
                    canAddAdmin ? : {
                        equal: boolean
                    },
                    canUpdateAdmin ? : {
                        equal: boolean
                    },
                    canRemoveAdmin ? : {
                        equal: boolean
                    },
                    canSearchAdmin ? : {
                        equal: boolean
                    },
                    canExportData ? : {
                        equal: boolean
                    },
                    canImportData ? : {
                        equal: boolean
                    },
                    canIncorporateClient ? : {
                        equal: boolean
                    },
                    canUpdateClient ? : {
                        equal: boolean
                    },
                    canDesincorporateClient ? : {
                        equal: boolean
                    },
                    canSearchClient ? : {
                        equal: boolean
                    },
                    canAddPayment ? : {
                        equal: boolean
                    },
                    canUpdatePayment ? : {
                        equal: boolean
                    },
                    canRemovePayment ? : {
                        equal: boolean
                    },
                    canSearchPayment ? : {
                        equal: boolean
                    },
                    canUpdateUserRoles ? : {
                        equal: boolean
                    },
                    foreign_key_base_role? :{
                        equal: number
                    }
                }
            }
        },
        orderBy ? : {
            //Nombre de la Tabla. Dada por los campos en TablNames.*
            [index:string] : {
                //Nombre del Campo. Nombre de la Tabla. Dada por los campos en TablNames.*.*
                [index:string]: 'ASC' | 'DESC'
            },
        },
        paging?:{
            limit?:number,
            offset?:number
        }
        ,includedRelations:string[]//Las tablas de las que seleccionaremos todos los datos.
        //'login' | 'membership' | 'role' | 'document' | 'jwt'
}

export interface IUserSearchMetaValidator {

}

export interface IUserSearchValidator {
    allowedTables:string[];
    firstName(value:any): boolean,
    surName(vaue:any): boolean,
    prefix(value:any):boolean,
    content(value:any): boolean,
    cutDate(value:any): boolean,
    inscriptionDate(value:any):boolean,
    company(value:any): boolean,
    username(value:any): boolean,
    token(value:any): boolean,
    canLogin(value:any): boolean,
    canChangePassword(value:any): boolean,
    canAddAdmin(value:any): boolean,
    canUpdateAdmin(value:any): boolean,
    canRemoveAdmin(value:any): boolean,
    canSearchAdmin(value:any): boolean,
    canExportData(value:any): boolean,
    canImportData(value:any): boolean,
    canIncorporateClient(value:any): boolean,
    canUpdateClient(value:any): boolean,
    canDesincorporateClient(value:any): boolean,
    canSearchClient(value:any): boolean,
    canAddPayment(value:any): boolean,
    canUpdatePayment(value:any): boolean,
    canRemovePayment(value:any): boolean,
    canSearchPayment(value:any): boolean,
    canUpdateUserRoles(value:any): boolean
}

export interface IBasicProfile {
    user:User,
    jwt:Jwt,
    role:Role
}