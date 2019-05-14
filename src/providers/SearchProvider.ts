import { IUserSearchOptions } from "../interfaces/User";
import { UserSearchResultMode } from "../enums/User";
import { User } from "../models/User";
import { TableAlias, TableNames } from "../enums/Database";
import { DatabaseService } from "./databaseAdmin";
import { UserSearchValidator, PaymentSearchValidator, LogSearchValidator } from "./SyntaxValidationProvider";
import { Membership } from "../models/Membership";
import { Role } from "../models/Role";
import { Jwt } from "../models/Jwt";
import { Login } from "../models/Login";
import {Document as Doc} from '../models/Document';
import { IPaymentSearchOption } from "../interfaces/Payment";
import { PaymentResultMode } from "../enums/Payment";
import { Currency } from "../models/Currency";
import { Payment } from "../models/Payment";
import { LogResultMode } from "../enums/Log";
import { ILogSearchOptions } from "../interfaces/Log";
import { Log } from "../models/Log";
import { LogContent } from "../models/audit/LogContent";
import { SelectQueryBuilder } from "typeorm";

/**
 * @description General Record search provider that allows searching functionalities.
 * Works as a singleton.
 */
export class SearchProvider {

    private static _instance:SearchProvider;

    private constructor(){

    }

    public static get Instance(): SearchProvider {
        this._instance = (this._instance) ? this._instance : new SearchProvider();
        return this._instance;
    }


    /**
     * @param searchOptions Options of search for the user
     * @param resultMode    Result mode option
     * @description         Executes a user record search with different parameters set on IUserSearchOptions.
     */
    public async searchUser(searchOptions:IUserSearchOptions, resultMode?:UserSearchResultMode){
        let query = this.buildUserSearchQuery(searchOptions);
        ///*
        let fullEntities:User[] = [];
        resultMode = (resultMode != undefined && resultMode != null) ? resultMode : <UserSearchResultMode>UserSearchResultMode.ENTITIES;
        switch(resultMode){
            case UserSearchResultMode.ENTITIES:
                let result:any[] = await query.getMany();
                //Map entitites
                if(result.length>0){
                    let entity:any;
                    for(entity in result){
                        if((searchOptions.includedRelations.indexOf(TableAlias.Role.MAIN)>-1)){
                            result[entity].role = await DatabaseService.Instance.connection.getRepository(Role).findOne({
                                where:{
                                    user:result[entity].id
                                }
                            });
                        }
                        if((searchOptions.includedRelations.indexOf(TableAlias.Membership.MAIN)>-1)){
                            result[entity].membership = await DatabaseService.Instance.connection.getRepository(Membership).findOne({
                                where:{
                                    user:result[entity].id
                                }
                            });
                        }
                        if((searchOptions.includedRelations.indexOf(TableAlias.Jwt.MAIN)>-1)){
                            result[entity].jwt = await DatabaseService.Instance.connection.getRepository(Jwt).findOne({
                                where:{
                                    user:result[entity].id
                                }
                            });
                        }
                        if((searchOptions.includedRelations.indexOf(TableAlias.Document.MAIN)>-1)){
                            result[entity].document = await DatabaseService.Instance.connection.getRepository(Doc).findOne({
                                where:{
                                    user:result[entity].id
                                }
                            });
                        }
                        if((searchOptions.includedRelations.indexOf(TableAlias.Login.MAIN)>-1)){
                            result[entity].login = await DatabaseService.Instance.connection.getRepository(Login).findOne({
                                where:{
                                    user:result[entity].id
                                }
                            });
                        }
                        fullEntities.push(result[entity]);
                    }
                }
                return fullEntities;
            case UserSearchResultMode.RAW:
            let resultB:any = await query.getRawMany();
            return resultB;
            case UserSearchResultMode.RAW_AND_ENTITIES:
            let resultC:{entities:User[], raw:any} = await query.getRawAndEntities();
            //Map entitites
            if(resultC.entities.length>0){
                let entity:any;
                for(entity in resultC.entities){
                    if((searchOptions.includedRelations.indexOf(TableAlias.Role.MAIN)>-1)){
                        resultC.entities[entity].role = await DatabaseService.Instance.connection.getRepository(Role).findOne({
                            where:{
                                user:resultC.entities[entity].id
                            }
                        });
                    }
                    if((searchOptions.includedRelations.indexOf(TableAlias.Membership.MAIN)>-1)){
                        resultC.entities[entity].membership = await DatabaseService.Instance.connection.getRepository(Membership).findOne({
                            where:{
                                user:resultC.entities[entity].id
                            }
                        });
                    }
                    if((searchOptions.includedRelations.indexOf(TableAlias.Jwt.MAIN)>-1)){
                        resultC.entities[entity].jwt = await DatabaseService.Instance.connection.getRepository(Jwt).findOne({
                            where:{
                                user:resultC.entities[entity].id
                            }
                        });
                    }
                    if((searchOptions.includedRelations.indexOf(TableAlias.Document.MAIN)>-1)){
                        resultC.entities[entity].document = await DatabaseService.Instance.connection.getRepository(Doc).findOne({
                            where:{
                                user:resultC.entities[entity].id
                            }
                        });
                    }
                    if((searchOptions.includedRelations.indexOf(TableAlias.Login.MAIN)>-1)){
                        resultC.entities[entity].login = await DatabaseService.Instance.connection.getRepository(Login).findOne({
                            where:{
                                user:resultC.entities[entity].id
                            }
                        });
                    }
                    fullEntities.push(resultC.entities[entity]);
                }
            }
            return resultC;
        }
    }

    /**
     * @param searchParameters Search parameters for the user query
     * @description Returns a SelectQueryBuilder object that allows the search of users
     */
    public buildUserSearchQuery(searchParameters:IUserSearchOptions):SelectQueryBuilder<User>{

        let repo = DatabaseService.Instance.connection.getRepository(User);
        const query = repo.createQueryBuilder('user');

        const validator: UserSearchValidator = new UserSearchValidator();
        
        const tableNames = Object.keys(searchParameters.where)
            .filter((tableName) => {
                return (tableName === TableAlias.User.MAIN) || (validator.allowedTables.indexOf(tableName) > -1);
            });
        let andWhere = false;

        
        let solveIncludes = ()=>{
            if(searchParameters.includedRelations != null && 
            (searchParameters.includedRelations.length>0)){

                searchParameters.includedRelations.forEach((tableName:string)=>{

                    if(!(tableName in searchParameters.where) && (tableName !== TableAlias.User.MAIN)){

                        let defaultTableCondition = `"${tableName}"."${TableNames.User.id}" = "${TableAlias.User.MAIN}"."${TableNames.User.id}"`;
                        let tableRef: any;
                        if(tableName === TableAlias.Membership.MAIN){
                            tableRef = Membership;
                        }else if(tableName === TableAlias.Role.MAIN){
                            tableRef = Role;
                        }else if(tableName === TableAlias.Jwt.MAIN){
                            tableRef = Jwt;
                        }else if(tableName === TableAlias.Login.MAIN){
                            tableRef = Login;
                        }else if(tableName === TableAlias.Document.MAIN){
                            tableRef = Doc;
                        }
                        if(tableRef){
                            query.leftJoinAndSelect(tableRef, tableName, defaultTableCondition);
                        }
                    }
                });
            }
        }

        let solveOrderBy = ()=>{
            if(searchParameters.orderBy){
                Object.keys(searchParameters.orderBy).forEach(tableName=>{
                    if(
                        (tableName !== TableAlias.User.MAIN)
                        && (
                            (Object.keys(searchParameters.where).indexOf(tableName)<0)
                            && 
                            (searchParameters.includedRelations && searchParameters.includedRelations.indexOf(tableName)<0)
                        )
                        && (validator.allowedTables.indexOf(tableName) > -1)
                    ){
                        let defaultTableCondition = `"${tableName}"."${TableNames.User.id}" = "${TableAlias.User.MAIN}"."${TableNames.User.id}"`;
                        let tableRef: any;
                        if(tableName === TableAlias.Membership.MAIN){
                            tableRef = Membership;
                        }else if(tableName === TableAlias.Role.MAIN){
                            tableRef = Role;
                        }else if(tableName === TableAlias.Jwt.MAIN){
                            tableRef = Jwt;
                        }else if(tableName === TableAlias.Login.MAIN){
                            tableRef = Login;
                        }else if(tableName === TableAlias.Document.MAIN){
                            tableRef = Doc;
                        }
                        if(tableRef){
                            query.innerJoin(tableRef, tableName, defaultTableCondition);
                        }
                    }
                });
            }
        }
        
        let joinTable = (tableName:any, query:any)=>{
            if (tableName !== "user") {

                let defaultTableCondition = `"${tableName}"."${TableNames.User.id}" = "${TableAlias.User.MAIN}"."${TableNames.User.id}"`;
                
                let tableRef: any;
                if(tableName === TableAlias.Membership.MAIN){
                    tableRef = Membership;
                }else if(tableName === TableAlias.Role.MAIN){
                    tableRef = Role;
                }else if(tableName === TableAlias.Jwt.MAIN){
                    tableRef = Jwt;
                }else if(tableName === TableAlias.Login.MAIN){
                    tableRef = Login;
                }else if(tableName === TableAlias.Document.MAIN){
                    tableRef = Doc;
                }
                if(tableRef){
                    if (searchParameters.includedRelations && searchParameters.includedRelations.indexOf(tableName) > -1) {                    
                        query.innerJoinAndSelect(tableRef, tableName, defaultTableCondition);
                    } else {
                        query.innerJoin(tableRef, tableName, defaultTableCondition);
                    }
                }
            }
        }

        solveIncludes();

        solveOrderBy();

        tableNames.forEach((tableName: string) => {
            let tableContentFields: string[]; //Los campos de contenido
            let tableMetaFieldNames: string[]; //Los campos de metadata
            let tableFieldNames:any = validator.getFieldNames(tableName)
            if (
                ( < any > searchParameters.where)[tableName] &&
                ( < any > searchParameters.where)[tableName].content) {
                tableContentFields = Object.keys(( < any > searchParameters.where)[tableName].content)
                    .filter((contentField: string) => {
                        return validator.getValidFields(tableName).indexOf(contentField.toLowerCase()) > -1;
                    });
            }
            if (
                ( < any > searchParameters.where)[tableName] &&
                ( < any > searchParameters.where)[tableName].meta) {
                tableMetaFieldNames = Object.keys(( < any > searchParameters.where)[tableName].meta)
                    .filter((metaField: string) => {
                        return validator.getValidFields(tableName).indexOf(metaField.toLowerCase()) > -1;
                    });
            }

            if (
                (tableContentFields && tableContentFields.length > 0) ||
                (tableMetaFieldNames && tableMetaFieldNames.length > 0)
            ) {
                //Unimos la tabla que buscamos




                joinTable(tableName, query);

                if (tableMetaFieldNames && tableMetaFieldNames.length > 0) {
                    //Buscamos por metainformación.
                    tableMetaFieldNames.forEach((metaFieldName: string) => {
                        //Búsqueda "equal": sólo un valor.

                        if ("equal" in ( < any > searchParameters.where)[tableName].meta[metaFieldName] &&
                            typeof (
                                ( < any > ( < any > searchParameters.where)[tableName]
                                    .meta)[metaFieldName].equal
                            ) !== "undefined" &&
                            (( < any > ( < any > searchParameters.where)[tableName]
                            .meta)[metaFieldName].equal) != null
                        ) {
                            let scapedVariableName = `${metaFieldName}_equal`;
                            let value = ( < any > searchParameters.where)[tableName].meta[metaFieldName].equal;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            let fieldName = (metaFieldName in tableFieldNames) ? tableFieldNames[metaFieldName] : metaFieldName;
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        }

                        if ("greater" in ( < any > searchParameters.where)[tableName].meta[metaFieldName] &&
                            typeof ( < any > searchParameters.where)[tableName].meta[metaFieldName].greater !== "undefined" &&
                            ( < any > searchParameters.where)[tableName].meta[metaFieldName].greater != null
                        ) {
                            let scapedVariableName = `${metaFieldName}_greater`;
                            let value = ( < any > searchParameters.where)[tableName].meta[metaFieldName].greater;
                            let fieldName = (metaFieldName in tableFieldNames) ? tableFieldNames[metaFieldName] : metaFieldName;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        }

                        if ("lesser" in ( < any > searchParameters.where)[tableName].meta[metaFieldName] &&
                            typeof ( < any > searchParameters.where)[tableName].meta[metaFieldName].lesser !== "undefined" &&
                            ( < any > searchParameters.where)[tableName].meta[metaFieldName].lesser != null
                        ) {
                            let scapedVariableName = `${metaFieldName}_lesser`;
                            let value = ( < any > searchParameters.where)[tableName].meta[metaFieldName].lesser;
                            let fieldName = (metaFieldName in tableFieldNames) ? tableFieldNames[metaFieldName] : metaFieldName;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        }
                    });
                }
                if (tableContentFields && tableContentFields.length > 0) {

                    //Buscamos por información de contenido.
                    tableContentFields.forEach((contentFieldName: string) => {
                        //Búsqueda "equal": sólo un valor.
                        if ("equal" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                            typeof (
                                ( < any > ( < any > searchParameters.where)[tableName]
                                    .content)[contentFieldName].equal
                            ) !== "undefined"
                        ) {
                            let scapedVariableName = `${contentFieldName}_equal`;
                            let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].equal;
                            let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : contentFieldName;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        } else if (
                            "like" in ( < any > searchParameters.where)[tableName].content[contentFieldName]
                            &&
                                (( < any > ( < any > searchParameters.where)[tableName]
                                .content)[contentFieldName].like
                                != undefined)
                            ) {
                            let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : (()=>{                                
                                return contentFieldName;
                            })();
                            let scapedVariableName = `${contentFieldName}_like`;
                            let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].like;
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" LIKE :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" LIKE :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        } else {
                            if (
                                ("greater" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].greater !== "undefined") ||
                                ("lesser" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].lesser !== "undefined")
                            ) {
                                if ("greater" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].greater !== "undefined") {
                                    let scapedVariableName = contentFieldName + "_greater";
                                    let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].greater;
                                    let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : contentFieldName;
                                    if (value instanceof Date){
                                        value = value.toISOString();
                                    }
                                    if (andWhere) {
                                        query.andWhere(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                            [ < any > scapedVariableName]: value
                                        });
                                    } else {
                                        query.where(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                            [ < any > scapedVariableName]: value
                                        });
                                        andWhere = true;
                                    }
                                }

                                if ("lesser" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].lesser !== "undefined") {
                                    let scapedVariableName = contentFieldName + "_lesser";
                                    let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].lesser;
                                    let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : contentFieldName;
                                    if (value instanceof Date){
                                        value = value.toISOString();
                                    }
                                    if (andWhere) {
                                        query.andWhere(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                            [scapedVariableName]: value
                                        });
                                    } else {
                                        query.where(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                            [ < any > scapedVariableName]: value
                                        });
                                        andWhere = true;
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });

        let ordered = false;    //Permite el limit y offset
        if(searchParameters.orderBy){
            let orderByTables:string[] = Object.keys(searchParameters.orderBy);
            orderByTables.forEach((tableName:string)=>{
                if(
                    validator.allowedTables.indexOf(tableName)>-1 
                    && (
                        Object.keys(((<any>searchParameters.orderBy)[tableName])).length > -1
                    )
                ){
                    let tableFieldNames = validator.getFieldNames(tableName);
                    Object.keys((<any>searchParameters.orderBy)[tableName]).forEach((fieldName:string)=>{
                        if(tableFieldNames 
                        && (tableFieldNames[fieldName] != undefined)
                        &&(
                            (<any>searchParameters.orderBy)[tableName][fieldName] === "ASC" ||
                            (<any>searchParameters.orderBy)[tableName][fieldName] === "DESC"
                        )){
                            let validFieldName = tableFieldNames[fieldName];
                            query.addOrderBy(`"${tableName}"."${validFieldName}"`,(<any>searchParameters.orderBy)[tableName][fieldName]);
                            ordered = true;
                        }
                    });
                }
            });
        }


        if(
            searchParameters.paging &&
            (searchParameters.paging.offset != undefined) && (searchParameters.paging.limit != undefined)  && ordered){
            if(
                !isNaN(searchParameters.paging.offset) || !isNaN(searchParameters.paging.limit)
            ){
                if(searchParameters.paging.limit) query.limit(searchParameters.paging.limit);
                if(searchParameters.paging.offset) query.offset(searchParameters.paging.offset);
            }
        }

        return query;
    }

    /**
     * 
     * @param searchOptions Payment search options to assemble the query
     * @param resultMode The result format to return
     */
    public async searchPayment(searchOptions: IPaymentSearchOption, resultMode: PaymentResultMode):
    Promise<Payment[]|{entities:Payment[], raw:any}|any[]>
    {
        let query = this.buildPaymentSearchQuery(searchOptions);
        ///*
        resultMode = (resultMode != undefined && resultMode != null) ? resultMode : <PaymentResultMode>PaymentResultMode.ENTITIES;
        switch(resultMode){
            case PaymentResultMode.ENTITIES:
                let result: {entities:Payment[], raw:any} = await query.getRawAndEntities();
                let fullEntities:Payment[] = [];
                //Map entitites
                if(result.entities.length>0){
                    for(let i=0;i < result.entities.length; i++){
                        
                        let entity:Payment = result.entities[i];
                        if((searchOptions.includedRelations.indexOf(TableAlias.Membership.MAIN)>-1)){
                            let tableName = TableAlias.Membership.MAIN;
                            let idTableName = Object.keys(TableNames).find((tableNameA:string)=>{
                                return (tableName.toLowerCase() === tableNameA.toLowerCase());
                            })
                            idTableName = (<any>TableNames)[idTableName].id;
                            let find_key = tableName+"_"+idTableName;
                            let find_id = result.raw[i][find_key];
                            entity.membership = await DatabaseService
                            .Instance.connection
                            .getRepository(Membership).findOne(find_id);
                        }
                        if((searchOptions.includedRelations.indexOf(TableAlias.Membership.MAIN)>-1)){
                            let tableName = TableAlias.Currency.MAIN;
                            let idTableName = Object.keys(TableNames).find((tableNameA:string)=>{
                                return (tableName.toLowerCase() === tableNameA.toLowerCase());
                            })
                            idTableName = (<any>TableNames)[idTableName].id;
                            let find_key = `${TableAlias.Payment.MAIN}_${TableNames.Payment.foreign_key_currency}`;
                            let find_id = result.raw[i][find_key];
                            entity.currency = await DatabaseService
                            .Instance.connection
                            .getRepository(Currency).findOne(find_id);
                        }
                        if((searchOptions.includedRelations.indexOf(TableAlias.User.MAIN)>-1)
                        && entity.membership !== undefined){
                            let tableName = TableAlias.Currency.MAIN;
                            let idTableName = Object.keys(TableNames).find((tableNameA:string)=>{
                                return (tableName.toLowerCase() === tableNameA.toLowerCase());
                            })
                            idTableName = (<any>TableNames)[idTableName].id;
                            let find_key = tableName+"_"+idTableName;
                            entity.membership.user = await DatabaseService
                            .Instance.connection
                            .getRepository(User).findOne({
                                where:{
                                    membership:entity.membership.id
                                }
                            });
                        }
                        fullEntities.push(entity);
                    }
                }
                return fullEntities;
            case PaymentResultMode.RAW:
                let resultB:any = await query.getRawMany();
                return resultB;
            case PaymentResultMode.RAW_AND_ENTITIES:
                let resultC:{entities:Payment[], raw:any} = await query.getRawAndEntities();
                //Map entitites
                if(resultC.entities.length>0){
                    let entity:any;
                    for(entity in resultC.entities){
                        if((searchOptions.includedRelations.indexOf(TableAlias.Membership.MAIN)>-1)){
                            resultC.entities[entity].membership = await DatabaseService.Instance.connection.getRepository(Membership).findOne({
                                where:{
                                    id:resultC.entities[entity].membership
                                }
                            });
                        }
                        resultC.entities.push(resultC.entities[entity]);
                    }
                }
                return resultC;
        }
    }

    /**
     * 
     * @param searchParameters Search parameters to apply to the search function
     * @description Builds and returns the search query for the TypeORM search
     */
    public buildPaymentSearchQuery(searchParameters: IPaymentSearchOption):SelectQueryBuilder<Payment>{

        const query = DatabaseService.Instance.connection.getRepository(Payment).createQueryBuilder(TableAlias.Payment.MAIN);

        const validator: PaymentSearchValidator = new PaymentSearchValidator();
        
        const tableNames = Object.keys(searchParameters.where)
            .filter((tableName) => {
                return (tableName === TableAlias.Payment.MAIN) || (validator.allowedTables.indexOf(tableName) > -1);
            });
        let andWhere = false;

        
        let solveIncludes = ()=>{
            if(searchParameters.includedRelations != null && 
            (searchParameters.includedRelations.length>0)){

                searchParameters.includedRelations.forEach((tableName:string)=>{
                    if(!(tableName in searchParameters.where) && (tableName !== TableAlias.Payment.MAIN)){

                        let idTableName = Object.keys(TableNames).find((tableNameA:string)=>{
                            return (tableName.toLowerCase() === tableNameA.toLowerCase());
                        })
                        idTableName = (<any>TableNames)[idTableName].id;
                        let defaultTableCondition = `"${TableAlias.Payment.MAIN}"."${idTableName}" = "${tableName}"."${idTableName}"`;
                        let tableRef: any;
                        if(tableName === TableAlias.Currency.MAIN){
                            tableRef = Currency;
                        }else if(tableName === TableAlias.Membership.MAIN){
                            tableRef = Membership;
                        }else if(tableName === TableAlias.Currency.MAIN){
                            tableRef = Currency;
                        }
                        if(tableRef){
                            query.leftJoinAndSelect(tableRef, tableName, defaultTableCondition);
                        }
                    }
                });
            }
        }

        let solveOrderBy = ()=>{
            if(searchParameters.orderBy){
                Object.keys(searchParameters.orderBy).forEach(tableName=>{
                    if(
                        (tableName !== TableAlias.User.MAIN)
                        && (
                            (Object.keys(searchParameters.where).indexOf(tableName)<0)
                            && 
                            (searchParameters.includedRelations && searchParameters.includedRelations.indexOf(tableName)<0)
                        )
                        && (validator.allowedTables.indexOf(tableName) > -1)
                    ){
                        
                        let idTableName = Object.keys(TableNames).find((tableNameA:string)=>{
                            return (tableName.toLowerCase() === tableNameA.toLowerCase());
                        })
                        idTableName = (<any>TableNames)[idTableName].id;
                        let defaultTableCondition = `"${TableAlias.Payment.MAIN}"."${idTableName}" = "${tableName}"."${idTableName}"`;
                        let tableRef: any;
                        if(tableName === TableAlias.Currency.MAIN){
                            tableRef = Currency;
                        }else if(tableName === TableAlias.Membership.MAIN){
                            tableRef = Membership;
                        }
                        if(tableRef){
                            query.innerJoin(tableRef, tableName, defaultTableCondition);
                        }
                    }
                });
            }
        }
        
        let joinTable = (tableName:any, query:any)=>{
            if (tableName !== "user") {
                let idTableName = Object.keys(TableNames).find((tableNameA:string)=>{
                    return (tableName.toLowerCase() === tableNameA.toLowerCase());
                })
                idTableName = (<any>TableNames)[idTableName].id;
                let defaultTableCondition = `"${TableAlias.Payment.MAIN}"."${idTableName}" = "${tableName}"."${idTableName}"`;
                let tableRef: any;
                if(tableName === TableAlias.Currency.MAIN){
                    tableRef = Currency;
                }else if(tableName === TableAlias.Membership.MAIN){
                    tableRef = Membership;
                }
                if(tableRef){
                    if (searchParameters.includedRelations && searchParameters.includedRelations.indexOf(tableName) > -1) {
                        query.innerJoinAndSelect(tableRef, tableName, defaultTableCondition);
                    } else {
                        query.innerJoin(tableRef, tableName, defaultTableCondition);
                    }
                }
            }
        }

        solveIncludes();

        solveOrderBy();

        tableNames.forEach((tableName: string) => {
            let tableContentFields: string[]; //Los campos de contenido
            let tableMetaFieldNames: string[]; //Los campos de metadata
            let tableFieldNames:any = validator.getFieldNames(tableName)
            if (
                ( < any > searchParameters.where)[tableName] &&
                ( < any > searchParameters.where)[tableName].content) {
                tableContentFields = Object.keys(( < any > searchParameters.where)[tableName].content)
                    .filter((contentField: string) => {
                        return validator.getValidFields(tableName).indexOf(contentField.toLowerCase()) > -1;
                    });
            }
            if (
                ( < any > searchParameters.where)[tableName] &&
                ( < any > searchParameters.where)[tableName].meta) {
                tableMetaFieldNames = Object.keys(( < any > searchParameters.where)[tableName].meta)
                    .filter((metaField: string) => {
                        return validator.getValidFields(tableName).indexOf(metaField.toLowerCase()) > -1;
                    });
            }

            if (
                (tableContentFields && tableContentFields.length > 0) ||
                (tableMetaFieldNames && tableMetaFieldNames.length > 0)
            ) {
                //Unimos la tabla que buscamos




                joinTable(tableName, query);

                if (tableMetaFieldNames && tableMetaFieldNames.length > 0) {
                    //Buscamos por metainformación.
                    tableMetaFieldNames.forEach((metaFieldName: string) => {
                        //Búsqueda "equal": sólo un valor.

                        if ("equal" in ( < any > searchParameters.where)[tableName].meta[metaFieldName] &&
                            typeof (
                                ( < any > ( < any > searchParameters.where)[tableName]
                                    .meta)[metaFieldName].equal
                            ) !== "undefined"
                        ) {
                            let scapedVariableName = `${metaFieldName}_equal`;
                            let value = ( < any > searchParameters.where)[tableName].meta[metaFieldName].equal;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            let fieldName = (metaFieldName in tableFieldNames) ? tableFieldNames[metaFieldName] : metaFieldName;
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        }

                        if ("greater" in ( < any > searchParameters.where)[tableName].meta[metaFieldName] &&
                            typeof ( < any > searchParameters.where)[tableName].meta[metaFieldName].greater !== "undefined" &&
                            ( < any > searchParameters.where)[tableName].meta[metaFieldName].greater != null
                        ) {
                            let scapedVariableName = `${metaFieldName}_greater`;
                            let value = ( < any > searchParameters.where)[tableName].meta[metaFieldName].greater;
                            let fieldName = (metaFieldName in tableFieldNames) ? tableFieldNames[metaFieldName] : metaFieldName;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        }

                        if ("lesser" in ( < any > searchParameters.where)[tableName].meta[metaFieldName] &&
                            typeof ( < any > searchParameters.where)[tableName].meta[metaFieldName].lesser !== "undefined" &&
                            ( < any > searchParameters.where)[tableName].meta[metaFieldName].lesser != null
                        ) {
                            let scapedVariableName = `${metaFieldName}_lesser`;
                            let value = ( < any > searchParameters.where)[tableName].meta[metaFieldName].lesser;
                            let fieldName = (metaFieldName in tableFieldNames) ? tableFieldNames[metaFieldName] : metaFieldName;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        }
                    });
                }

                if (tableContentFields && tableContentFields.length > 0) {

                    //Buscamos por metainformación.
                    tableContentFields.forEach((contentFieldName: string) => {
                        //Búsqueda "equal": sólo un valor.
                        if ("equal" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                            typeof (
                                ( < any > ( < any > searchParameters.where)[tableName]
                                    .content)[contentFieldName].equal
                            ) !== "undefined"
                        ) {
                            let scapedVariableName = `${contentFieldName}_equal`;
                            let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].equal;
                            let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : contentFieldName;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        } else if (
                            "like" in ( < any > searchParameters.where)[tableName].content[contentFieldName]
                            &&
                                (( < any > ( < any > searchParameters.where)[tableName]
                                .content)[contentFieldName].like
                                != undefined)
                            ) {
                            let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : (()=>{                                
                                return contentFieldName;
                            })();
                            let scapedVariableName = `${contentFieldName}_like`;
                            let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].like;
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" LIKE :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" LIKE :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        } else {

                            if (
                                ("greater" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].greater !== "undefined") ||
                                ("lesser" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].lesser !== "undefined")
                            ) {
                                if ("greater" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].greater !== "undefined") {
                                    let scapedVariableName = contentFieldName + "_greater";
                                    let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].greater;
                                    let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : contentFieldName;
                                    if (value instanceof Date){
                                        value = value.toISOString();
                                    }
                                    if (andWhere) {
                                        query.andWhere(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                            [ < any > scapedVariableName]: value
                                        });
                                    } else {
                                        query.where(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                            [ < any > scapedVariableName]: value
                                        });
                                        andWhere = true;
                                    }
                                }

                                if ("lesser" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].lesser !== "undefined") {
                                    let scapedVariableName = contentFieldName + "_lesser";
                                    let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].lesser;
                                    let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : contentFieldName;
                                    if (value instanceof Date){
                                        value = value.toISOString();
                                    }
                                    if (andWhere) {
                                        query.andWhere(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                            [scapedVariableName]: value
                                        });
                                    } else {
                                        query.where(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                            [ < any > scapedVariableName]: value
                                        });
                                        andWhere = true;
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });

        let ordered = false;    //Permite el limit y offset
        if(searchParameters.orderBy){
            let orderByTables:string[] = Object.keys(searchParameters.orderBy);
            orderByTables.forEach((tableName:string)=>{
                if(
                    validator.allowedTables.indexOf(tableName)>-1 
                    && (
                        Object.keys(((<any>searchParameters.orderBy)[tableName])).length > -1
                    )
                ){
                    let tableFieldNames = validator.getFieldNames(tableName);
                    Object.keys((<any>searchParameters.orderBy)[tableName]).forEach((fieldName:string)=>{
                        if(tableFieldNames 
                        && (tableFieldNames[fieldName] != undefined)
                        &&(
                            (<any>searchParameters.orderBy)[tableName][fieldName] === "ASC" ||
                            (<any>searchParameters.orderBy)[tableName][fieldName] === "DESC"
                        )){
                            let validFieldName = tableFieldNames[fieldName];
                            query.addOrderBy(`${tableName}.${validFieldName}`,(<any>searchParameters.orderBy)[tableName][fieldName]);
                            ordered = true;
                        }
                    });
                }
            });
        }


        if(
            searchParameters.paging &&
            (searchParameters.paging.offset != undefined) && (searchParameters.paging.limit != undefined)  && ordered){
            if(
                !isNaN(searchParameters.paging.offset) || !isNaN(searchParameters.paging.limit)
            ){
                if(searchParameters.paging.limit) query.limit(searchParameters.paging.limit);
                if(searchParameters.paging.offset) query.offset(searchParameters.paging.offset);
            }
        }

        return query;
    }

    /**
     * 
     * @param searchOptions Options to search the log to
     * @param resultMode The result mode demanded from the function
     * @description Returns the results from the executed search on log records on the database.
     */
    public async searchLogs(searchOptions: ILogSearchOptions, resultMode: LogResultMode):
    Promise<Log[]|{entities:Log[], raw:any}|any[]>{
        let query = this.buildLogSearchQuery(searchOptions);
        ///*
        let fullEntities: Log[] = [];
        resultMode = (resultMode != undefined && resultMode != null) ? resultMode : <LogResultMode>LogResultMode.ENTITIES;
        switch(resultMode){
            case LogResultMode.ENTITIES:
                let result: {entities:Log[], raw:any} = await query.getRawAndEntities();
                //Map entitites
                if(result.entities.length>0){
                    for(let i=0;i < result.entities.length; i++){
                        let entity:Log = result.entities[i];
                        if((searchOptions.includedRelations.indexOf(TableAlias.User.MAIN)>-1)){
                            let tableName = TableAlias.User.MAIN;
                            let idTableName = Object.keys(TableNames).find((tableNameA:string)=>{
                                return (tableName.toLowerCase() === tableNameA.toLowerCase());
                            })
                            idTableName = (<any>TableNames)[idTableName].id;
                            let find_key = tableName+"_"+idTableName;
                            let find_id = result.raw[i][find_key];
                            entity.user = await DatabaseService
                            .Instance.connection
                            .getRepository(User).findOne(find_id);
                        }
                        if((searchOptions.includedRelations.indexOf(TableAlias.LogContent.MAIN)>-1)){
                            let content = await DatabaseService
                            .Instance.auditConnection
                            .getRepository(LogContent).findOne({
                                where:{
                                    logId:entity.id
                                }
                            });
                            if(content){
                                entity.content = content;
                            }
                        }
                        fullEntities.push(entity);
                    }
                }
                return fullEntities;
            case LogResultMode.RAW:
            let resultB:any = await query.getRawMany();
            return resultB;
            
            case LogResultMode.RAW_AND_ENTITIES:
            let resultC:{entities:Log[], raw:any} = await query.getRawAndEntities();
            //Map entitites
            if(resultC.entities.length>0){
                let entity:any;
                for(entity in resultC.entities){
                    if((searchOptions.includedRelations.indexOf(TableAlias.User.MAIN)>-1)){
                        let query = DatabaseService.Instance.connection.getRepository(User)
                        .createQueryBuilder('user')
                        .innerJoin(Log, 'log', `log.id = :logID AND log.usuario = user.usuario`,{
                            logID:resultC.entities[entity].id
                        });
                        let user = await query.getOne();
                        resultC.entities[entity].user = user;
                    }
                    if((searchOptions.includedRelations.indexOf(TableAlias.LogContent.MAIN)>-1)){
                        let content = await DatabaseService
                        .Instance.auditConnection
                        .getRepository(LogContent).findOne({
                            where:{
                                logId:entity.id
                            }
                        });
                        if(content){
                            entity.content = content;
                        }
                    }
                    fullEntities.push(resultC.entities[entity]);
                }
            }
            return resultC;
        }
    }

    /**
     * 
     * @param searchParameters The parameters for the log search
     * @description Generates the search query for the log search function
     */
    public buildLogSearchQuery(searchParameters: ILogSearchOptions):SelectQueryBuilder<Log>{

        const query = DatabaseService.Instance.connection.getRepository(Log).createQueryBuilder(TableAlias.Log.MAIN);

        const validator: LogSearchValidator = new LogSearchValidator();
        
        const tableNames = Object.keys(searchParameters.where)
            .filter((tableName) => {
                return (tableName === TableAlias.Log.MAIN) || (validator.allowedTables.indexOf(tableName) > -1);
            });
        let andWhere = false;

        
        let solveIncludes = ()=>{
            if(searchParameters.includedRelations != null && 
            (searchParameters.includedRelations.length>0)){

                searchParameters.includedRelations.forEach((tableName:string)=>{
                    if(!(tableName in searchParameters.where) && (tableName !== TableAlias.Log.MAIN)){

                        let idTableName = Object.keys(TableNames).find((tableNameA:string)=>{
                            return (tableName.toLowerCase() === tableNameA.toLowerCase());
                        })
                        if((<any>TableNames)[idTableName]){
                            idTableName = (<any>TableNames)[idTableName].id;
                            let defaultTableCondition = `"${TableAlias.Log.MAIN}"."${idTableName}" = "${tableName}"."${idTableName}"`;
                            let tableRef: any;
                            if(tableName === TableAlias.User.MAIN){
                                tableRef = User;
                            }
                            if(tableRef){
                                query.leftJoinAndSelect(tableRef, tableName, defaultTableCondition);
                            }
                        }
                    }
                });
            }
        }

        let solveOrderBy = ()=>{
            if(searchParameters.orderBy){
                Object.keys(searchParameters.orderBy).forEach(tableName=>{
                    if(
                        (tableName !== TableAlias.User.MAIN)
                        && (
                            (Object.keys(searchParameters.where).indexOf(tableName)<0)
                            && 
                            (searchParameters.includedRelations && searchParameters.includedRelations.indexOf(tableName)<0)
                        )
                        && (validator.allowedTables.indexOf(tableName) > -1)
                    ){
                        
                        let idTableName = Object.keys(TableNames).find((tableNameA:string)=>{
                            return (tableName.toLowerCase() === tableNameA.toLowerCase());
                        })
                        idTableName = (<any>TableNames)[idTableName].id;
                        let defaultTableCondition = `"${TableAlias.Log.MAIN}"."${idTableName}" = "${tableName}"."${idTableName}"`;
                        let tableRef: any;
                        if(tableName === TableAlias.User.MAIN){
                            tableRef = User;
                        }
                        if(tableRef){
                            query.innerJoin(tableRef, tableName, defaultTableCondition);
                        }
                    }
                });
            }
        }
        
        let joinTable = (tableName:any, query:any)=>{
            if (tableName !== "log") {
                let idTableName = Object.keys(TableNames).find((tableNameA:string)=>{
                    return (tableName.toLowerCase() === tableNameA.toLowerCase());
                })
                idTableName = (<any>TableNames)[idTableName].id;
                let defaultTableCondition = `"${TableAlias.Log.MAIN}"."${idTableName}" = "${tableName}"."${idTableName}"`;
                let tableRef: any;
                if(TableAlias.User.MAIN){
                    tableRef = User;
                }
                if(tableRef){
                    if (searchParameters.includedRelations && searchParameters.includedRelations.indexOf(tableName) > -1) {
                        query.innerJoinAndSelect(tableRef, tableName, defaultTableCondition);
                    } else {
                        query.innerJoin(tableRef, tableName, defaultTableCondition);
                    }
                }
            }
        }

        solveIncludes();

        solveOrderBy();

        tableNames.forEach((tableName: string) => {
            let tableContentFields: string[]; //Los campos de contenido
            let tableMetaFieldNames: string[]; //Los campos de metadata
            let tableFieldNames:any = validator.getFieldNames(tableName)
            if (
                ( < any > searchParameters.where)[tableName] &&
                ( < any > searchParameters.where)[tableName].content) {
                tableContentFields = Object.keys(( < any > searchParameters.where)[tableName].content)
                    .filter((contentField: string) => {
                        return validator.getValidFields(tableName).indexOf(contentField.toLowerCase()) > -1;
                    });
            }
            if (
                ( < any > searchParameters.where)[tableName] &&
                ( < any > searchParameters.where)[tableName].meta) {
                tableMetaFieldNames = Object.keys(( < any > searchParameters.where)[tableName].meta)
                    .filter((metaField: string) => {
                        return validator.getValidFields(tableName).indexOf(metaField.toLowerCase()) > -1;
                    });
            }

            if (
                (tableContentFields && tableContentFields.length > 0) ||
                (tableMetaFieldNames && tableMetaFieldNames.length > 0)
            ) {
                //Unimos la tabla que buscamos

                joinTable(tableName, query);

                if (tableMetaFieldNames && tableMetaFieldNames.length > 0) {
                    //Buscamos por metainformación.
                    tableMetaFieldNames.forEach((metaFieldName: string) => {
                        //Búsqueda "equal": sólo un valor.

                        if ("equal" in ( < any > searchParameters.where)[tableName].meta[metaFieldName] &&
                            typeof (
                                ( < any > ( < any > searchParameters.where)[tableName]
                                    .meta)[metaFieldName].equal
                            ) !== "undefined"
                        ) {
                            let scapedVariableName = `${metaFieldName}_equal`;
                            let value = ( < any > searchParameters.where)[tableName].meta[metaFieldName].equal;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            let fieldName = (metaFieldName in tableFieldNames) ? tableFieldNames[metaFieldName] : metaFieldName;
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        }

                        if ("greater" in ( < any > searchParameters.where)[tableName].meta[metaFieldName] &&
                            typeof ( < any > searchParameters.where)[tableName].meta[metaFieldName].greater !== "undefined" &&
                            ( < any > searchParameters.where)[tableName].meta[metaFieldName].greater != null
                        ) {
                            let scapedVariableName = `${metaFieldName}_greater`;
                            let value = ( < any > searchParameters.where)[tableName].meta[metaFieldName].greater;
                            let fieldName = (metaFieldName in tableFieldNames) ? tableFieldNames[metaFieldName] : metaFieldName;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        }

                        if ("lesser" in ( < any > searchParameters.where)[tableName].meta[metaFieldName] &&
                            typeof ( < any > searchParameters.where)[tableName].meta[metaFieldName].lesser !== "undefined" &&
                            ( < any > searchParameters.where)[tableName].meta[metaFieldName].lesser != null
                        ) {
                            let scapedVariableName = `${metaFieldName}_lesser`;
                            let value = ( < any > searchParameters.where)[tableName].meta[metaFieldName].lesser;
                            let fieldName = (metaFieldName in tableFieldNames) ? tableFieldNames[metaFieldName] : metaFieldName;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        }
                    });
                }

                if (tableContentFields && tableContentFields.length > 0) {

                    //Buscamos por metainformación.
                    tableContentFields.forEach((contentFieldName: string) => {
                        //Búsqueda "equal": sólo un valor.
                        if ("equal" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                            typeof (
                                ( < any > ( < any > searchParameters.where)[tableName]
                                    .content)[contentFieldName].equal
                            ) !== "undefined"
                        ) {
                            let scapedVariableName = `${contentFieldName}_equal`;
                            let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].equal;
                            let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : contentFieldName;
                            if (value instanceof Date){
                                value = value.toISOString();
                            }
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" = :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        } else if (
                            "like" in ( < any > searchParameters.where)[tableName].content[contentFieldName]
                            &&
                                (( < any > ( < any > searchParameters.where)[tableName]
                                .content)[contentFieldName].like
                                != undefined)
                            ) {
                            let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : (()=>{                                
                                return contentFieldName;
                            })();
                            let scapedVariableName = `${contentFieldName}_like`;
                            let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].like;
                            if (andWhere) {
                                query.andWhere(`"${tableName}"."${fieldName}" LIKE :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                            } else {
                                query.where(`"${tableName}"."${fieldName}" LIKE :${scapedVariableName}`, {
                                    [scapedVariableName]: value
                                });
                                andWhere = true;
                            }
                        } else {

                            if (
                                ("greater" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].greater !== "undefined") ||
                                ("lesser" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].lesser !== "undefined")
                            ) {
                                if ("greater" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].greater !== "undefined") {
                                    let scapedVariableName = contentFieldName + "_greater";
                                    let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].greater;
                                    let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : contentFieldName;
                                    if (value instanceof Date){
                                        value = value.toISOString();
                                    }
                                    if (andWhere) {
                                        query.andWhere(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                            [ < any > scapedVariableName]: value
                                        });
                                    } else {
                                        query.where(`"${tableName}"."${fieldName}" > :${scapedVariableName}`, {
                                            [ < any > scapedVariableName]: value
                                        });
                                        andWhere = true;
                                    }
                                }

                                if ("lesser" in ( < any > searchParameters.where)[tableName].content[contentFieldName] &&
                                    typeof ( < any > searchParameters.where)[tableName].content[contentFieldName].lesser !== "undefined") {
                                    let scapedVariableName = contentFieldName + "_lesser";
                                    let value = ( < any > searchParameters.where)[tableName].content[contentFieldName].lesser;
                                    let fieldName = (contentFieldName in tableFieldNames) ? tableFieldNames[contentFieldName] : contentFieldName;
                                    if (value instanceof Date){
                                        value = value.toISOString();
                                    }
                                    if (andWhere) {
                                        query.andWhere(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                            [scapedVariableName]: value
                                        });
                                    } else {
                                        query.where(`"${tableName}"."${fieldName}" < :${scapedVariableName}`, {
                                            [ < any > scapedVariableName]: value
                                        });
                                        andWhere = true;
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });

        let ordered = false;    //Permite el limit y offset
        if(searchParameters.orderBy){
            let orderByTables:string[] = Object.keys(searchParameters.orderBy);
            orderByTables.forEach((tableName:string)=>{
                if(
                    validator.allowedTables.indexOf(tableName)>-1 
                    && (
                        Object.keys(((<any>searchParameters.orderBy)[tableName])).length > -1
                    )
                ){
                    let tableFieldNames = validator.getFieldNames(tableName);
                    Object.keys((<any>searchParameters.orderBy)[tableName]).forEach((fieldName:string)=>{
                        if(tableFieldNames 
                        && (tableFieldNames[fieldName] != undefined)
                        &&(
                            (<any>searchParameters.orderBy)[tableName][fieldName] === "ASC" ||
                            (<any>searchParameters.orderBy)[tableName][fieldName] === "DESC"
                        )){
                            let validFieldName = tableFieldNames[fieldName];
                            query.addOrderBy(`"${tableName}"."${validFieldName}"`,(<any>searchParameters.orderBy)[tableName][fieldName]);
                            ordered = true;
                        }
                    });
                }
            });
        }


        if(
            searchParameters.paging &&
            (searchParameters.paging.offset != undefined) && (searchParameters.paging.limit != undefined)  && ordered){
            if(
                !isNaN(searchParameters.paging.offset) || !isNaN(searchParameters.paging.limit)
            ){
                if(searchParameters.paging.limit) query.limit(searchParameters.paging.limit);
                if(searchParameters.paging.offset) query.offset(searchParameters.paging.offset);
            }
        }

        return query;
    }

}