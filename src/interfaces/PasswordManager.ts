import { Role } from '../models/Role';
import { Jwt } from '../models/Jwt';
import * as JWT from 'jsonwebtoken';

export enum HASH_ALGORITHM {
    SHA512 = "SHA_512"
}

/**
 * @description Interfaz del resultado de hacer un hashing al password
 * por medio del método hashPassword
 * @implements {enum HASH_ALGORITH}
 */
export interface IHashPasswordResult {
    salt: string;
    algorithm: HASH_ALGORITHM,
    hashValue: string
}

export enum ETokenVerifyResult {
    JsonWebTokenError = 0,
    NotBeforeError = 1,
    TokenExpiredError = 2,
    UnknownError = 3,
    Success = 25
}
/**
 * @description Interfaz del resultado de la operación de generación del token
 * y su almacenamiento en la base de datos.
 * @implements {Jwt}
 */
export interface ITokenInterface {
    data:{
        exp:number,
        _id:number,
        user:{
            id:number | string,
            userName:string,
            role:Role
        }
    },
    token: string,
    jwt: Jwt
}

/**
 * @description Interfaz de payload interno del token.
 */
export interface ITokenInternalContent {
    exp: number,
    _id: number,
    user:{
        id: number,
        userName: string,
        role:Role | null
    }
};


export interface ITokenVerifyResult {
    data: ITokenInternalContent | JWT.JsonWebTokenError | JWT.NotBeforeError | JWT.TokenExpiredError | JWT.VerifyErrors | Error,
    code: ETokenVerifyResult
}