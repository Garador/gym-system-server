import { Log } from "../models/Log";
import { LogContent } from "../models/audit/LogContent";
import { IValidateLogCreationPayloadResult } from "./SyntaxValidationProvider";
import { LogCreationResult, LogActions } from "../enums/Log";
import { IMetadataSearchOptions } from "./User";

export interface ILogCreationResult {
    created: boolean,
    message: IValidateLogCreationPayloadResult,
    result: LogCreationResult,
    log: Log,
    logContent?: LogContent
}


export interface ILogCreationPayload {
    action: LogActions,
    previousValue?: string,
    newValue?: string,
    actionTime: Date
}



export interface ILogSearchOptions {
    where: {
            log? : {
                meta ? : IMetadataSearchOptions,
                content ? : {
                    event_time ? : {
                        greater ? : Date,
                        lesser ? : Date
                    },
                    action_performed ? : {
                        equal : number
                    },
                    foreign_key_user ? : {
                        equal : number
                    }
                }
            }
        },
        orderBy ? : {
            //Nombre de la Tabla. Dada por los campos en TableNames.*
            [index:string] : {
                //Nombre del Campo. Nombre de la Tabla. Dada por los campos en TableNames.*.*
                [index:string]: 'ASC' | 'DESC'
            },
        },
        paging?:{
            limit?:number,
            offset?:number
        }
        ,includedRelations?:string[]//Las tablas de las que seleccionaremos todos los datos.
        //'user'
}