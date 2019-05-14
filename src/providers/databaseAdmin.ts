import "reflect-metadata";
import {createConnection, Connection} from 'typeorm';
import * as path from 'path';
import { DB_FILE_LOC } from '../enums/Database';

import {User} from '../models/User';
import {UserContact} from '../models/UserContact';
import {BaseRole} from '../models/BaseRole';
import {Company} from '../models/Company';
import {Currency} from '../models/Currency';
import {Document as Doc} from '../models/Document';
import {Jwt} from '../models/Jwt';
import {Log} from '../models/Log';
import {LogActions} from '../models/LogActions';
import {Login} from '../models/Login';
import {Membership} from '../models/Membership';
import {Payment} from '../models/Payment';
import {Role} from '../models/Role';
import {LogContent} from '../models/audit/LogContent';
import {MainPath} from './const';
import { ConnectionConf } from "../interfaces/DatabaseAdmin";


/**
 * @description Singleton Service that allows the connection and initialization to the database.
 */
export class DatabaseService {
    private _testing: boolean;
    private static _instance: DatabaseService;
    public _initialized:boolean = false;
    //Testing, development configuration
    public readonly _testingConfig:ConnectionConf = {
        primary: {
            connection: {
                name:"testing_primary",
                type: "sqlite",
                synchronize: true,
                logging: false,
                logger: "simple-console",
                database: (():string=>{
                    let res = DB_FILE_LOC.database_test_main.replace(new RegExp(DB_FILE_LOC.RP, 'g'), MainPath).replace(new RegExp(DB_FILE_LOC.PS, 'g'), path.sep)
                    return res;
                })(),
                generationStrategy: "increment",
               entities:[
                    User,
                    UserContact,
                    BaseRole,
                    Company,
                    Currency,
                    Doc,
                    Jwt,
                    Log,
                    LogActions,
                    Login,
                    Membership,
                    Payment,
                    Role
               ]
            }
        },
        audit: {
            connection: {
                name:'testing_audit',
                type: "sqlite",
                synchronize: true,
                logging: false,
                logger: "simple-console",
                database:(():string=>{
                    let res = DB_FILE_LOC.database_test_audit.replace(new RegExp(DB_FILE_LOC.RP, 'g'), MainPath).replace(new RegExp(DB_FILE_LOC.PS, 'g'), path.sep)
                    return res;
                })(),
                generationStrategy: "increment",
                entities: [
                    LogContent
                ]
            }
        }
    }
    //Production environment configuration
    public readonly _prodConfig:ConnectionConf = {
        primary: {
            connection: {
                name:"production_primary",
                type: "sqlite",
                synchronize: true,
                logging: false,
                logger: "simple-console",
                database:(():string=>{
                    let res = DB_FILE_LOC.database_prod_main.replace(new RegExp(DB_FILE_LOC.RP, 'g'), MainPath).replace(new RegExp(DB_FILE_LOC.PS, 'g'), path.sep)
                    return res;
                })(),
                generationStrategy: "increment",
                entities: [
                    User,
                    UserContact,
                    BaseRole,
                    Company,
                    Currency,
                    Doc,
                    Jwt,
                    Log,
                    LogActions,
                    Login,
                    Membership,
                    Payment,
                    Role
                ],
            }
        },audit: {
            connection: {
                name:"production_audit",
                type: "sqlite",
                synchronize: true,
                logging: false,
                logger: "simple-console",
                database:(():string=>{
                    let res = DB_FILE_LOC.database_prod_audit.replace(new RegExp(DB_FILE_LOC.RP, 'g'), MainPath).replace(new RegExp(DB_FILE_LOC.PS, 'g'), path.sep)
                    return res;
                })(),
                generationStrategy: "increment",
                entities: [
                    LogContent
                ]
            }
        }
    }

    public _currentConfig:ConnectionConf;

    public set currentConfig(currentConfig:ConnectionConf){
        this._currentConfig = currentConfig;
    }

    public get currentConfig(){
        return this._currentConfig;
    }

    /**@description Conexión usada para las operaciones principales de la base de datos. */
    private _primaryConnection: Connection;
    /**@description Conexión usada para guardar los logs extendidos (con contenido) para motivos de auditoría */
    private _auditConnection: Connection;
    
    constructor(){
        //this.initialize();
    }

    public set testing(testing: boolean){
        this._testing = testing;
    }

    public get testing(){
        return this._testing;
    }

    public get connection(): Connection{
        return this._primaryConnection;
    }

    public get auditConnection(): Connection{
        return this._auditConnection;
    }

    public async closeConnection(){        
        let result = (this._primaryConnection && this._primaryConnection.isConnected) ?  await this._primaryConnection.close() : new Error('Connection not initialized...');
        return result;
    }

    public static get Instance(): DatabaseService{
        this._instance = (this._instance || new DatabaseService());
        return this._instance;
    }

    /**
     * @description Initializes the database and connects it.
     */
    public async initialize() {
        let primaryConnectionData: any = this.testing ? this._testingConfig.primary.connection : this._prodConfig.primary.connection;        
        let auditConnectionData: any = this.testing ? this._testingConfig.audit.connection : this._prodConfig.audit.connection;
        this.currentConfig = {
            audit: {
                connection:auditConnectionData
            },
            primary:{
                connection: primaryConnectionData
            }
        }
        console.log(`
        
        *****************************************************************************
        primaryConnectionData 166 location: ${(primaryConnectionData).database}
        *****************************************************************************

        `);
        try{
            if(!this._initialized){
                this._initialized = true;
                await new Promise((accept)=>{
                    //this._primaryConnection = await ;
                    let initPromise:Array<Promise<Connection>> = [];
                    initPromise.push(createConnection(primaryConnectionData));
                    initPromise.push(createConnection(auditConnectionData));
                    //this._auditConnection = await ;
                    Promise.all(initPromise)
                    .then((result)=>{
                        this._primaryConnection = result[0];
                        this._auditConnection = result[1];

                        console.log(`

                        *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+
                        databaseAdmin.initialized 187 PROMISE FINISHED
                        *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+
                        
                        `);
                        accept();
                    })
                    .catch((e)=>{
                        console.log(`

                        *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+
                        databaseAdmin.initialized 197 PROMISE ERROR CAUGH
                        *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+

                        error: `,e);
                        accept();
                    });
                });  

                console.log(`
                        
                *   *   *   *   FINISHED PROMISE   *   *   *   *
                
                `);

                console.log(`

                *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+
                databaseAdmin.initialized 214 TO RETURN
                *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+

                `);
                return true;
            }
            return false;
        }catch(e){
            console.log(`
            
            *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+
            Error at databaseAdmin.initialize caught:
            *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+

            `, e,`
            
            `);
            return false;
        }
    }


    public async saveModel(model: any){
        let result = await this._primaryConnection.manager.save(model);
        return result;
    }
}