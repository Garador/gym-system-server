import { IMetadataSearchOptions } from "./User";
import { PAYMENT_METHODS } from "../enums/PaymentMethods";

export interface IPaymentSearchOption {
    where: {
            membership? : {
                meta ? : IMetadataSearchOptions
                ,content:{
                    foreign_key_user:{
                        equal:number
                    }
                }
            },
            payment? : {
                meta ? : IMetadataSearchOptions,
                content ? : {
                    ammount ? : {
                        greater ? : number,
                        lesser ? : number
                    },
                    paymentMethod ? : {
                        equal : PAYMENT_METHODS
                    },
                    notes ? : {
                        like ? : string,
                        equal ? : string
                    },
                    foreign_key_currency ? : {
                        equal : string
                    },
                    foreign_key_membership ? : {
                        equal : string | number
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
        //'login' | 'membership' | 'role' | 'document' | 'jwt'
}