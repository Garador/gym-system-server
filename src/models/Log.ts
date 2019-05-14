import { Entity, UpdateDateColumn, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import {TableNames} from '../enums/Database';
import {ITableMetadata} from '../interfaces/TableStructure';
import { User } from "./User";
import { LogActions as LogActionsE, LogCreationResult } from "../enums/Log";
import { LogContent } from "./audit/LogContent";
import { ILogCreationPayload, ILogCreationResult } from "../interfaces/Log";
import { DatabaseService } from "../providers/databaseAdmin";
import { LogActions } from "./LogActions";
import { toJson } from "../interfaces/Socket";


@Entity({
    name: TableNames.Log.table_name
})
export class Log implements ITableMetadata {

    public static logPreferences: LogActions;

    //+Metadata
    @PrimaryGeneratedColumn({
    //@PrimaryColumn({
        name:TableNames.Log.id
    })
    id: number;

    @CreateDateColumn({
        name:TableNames.Log.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name:TableNames.Log.updatedAt
    })
    updatedAt: Date;

    @Column({
        name:TableNames.Log.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name:TableNames.Log.action_performed
    })
    action: number;


    @Column({
        name:TableNames.Log.event_time
    })
    actionTime: Date;
    //-Columnas

    //+Lláves Foráneas
    @ManyToOne(type => User, user => user.logs)
    @JoinColumn({
        name: TableNames.Log.foreign_key_user
    })
    user: User;
    //-Lláves Foráneas

    content:LogContent;

    toJson():toJson.ILog{
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            action: this.action,
            actionTime: this.actionTime,
            user: (this.user instanceof User) ? this.user.id : this.user,
            content: (this.content instanceof LogContent) ? this.content.toJson() : this.content
        }
    }

    public static async logAction(user:User, logPayload:ILogCreationPayload): Promise < ILogCreationResult > {
        try{
            if(!Log.logPreferences){
                Log.logPreferences = LogActions.Instance;
                if(!Log.logPreferences){
                    throw new Error('logPreferences not loaded...')
                }
            }
            if(!this.canLog(logPayload.action)){
                return {
                    created:false,
                    message:null,
                    result:LogCreationResult.NOT_ALLOWED,
                    log:null
                }
            }
            let logResult:ILogCreationResult = {
                created:null,
                message:null,
                result:null,
                log:null
            }
            let newLog = new Log();
            newLog.action = logPayload.action;
            newLog.user = user;
            newLog.actionTime = logPayload.actionTime;
            newLog.status = 1;

            newLog = await DatabaseService.Instance.connection.getRepository(Log).save(newLog);
            logResult.log = newLog;

            if(logPayload.newValue || logPayload.previousValue){
                logResult.logContent = new LogContent();
                logResult.logContent.logId =  logResult.log.id;
                logResult.logContent.status = 1;
                logResult.logContent.previousValue =  logPayload.previousValue ? logPayload.previousValue : null;
                logResult.logContent.newValue =  logPayload.newValue ? logPayload.newValue : null;
                //logResult.logContent = await DatabaseService.Instance.auditConnection.getRepository(LogContent).save(logResult.logContent);
                logResult.logContent = await DatabaseService.Instance.auditConnection.getRepository(LogContent).save(logResult.logContent);
            }
            logResult.created = true;
            return logResult;
        }catch(e){
            console.log("Error logging action...");
            console.log(e);
        }
    }

    public static canLog(action: LogActionsE){
        switch(action){
            case LogActionsE.super_admin_creation: return Log.logPreferences.Log_AddAdmin;
            case LogActionsE.super_admin_update: return Log.logPreferences.Log_UpdateAdmin;
            case LogActionsE.auth_login: return Log.logPreferences.Log_Login;
            case LogActionsE.auth_logout: return Log.logPreferences.Log_LogOut;
            case LogActionsE.auth_changed_password: return Log.logPreferences.Log_ChangePassword;
            case LogActionsE.admin_add: return Log.logPreferences.Log_AddAdmin;
            case LogActionsE.admin_update: return Log.logPreferences.Log_UpdateAdmin;
            case LogActionsE.admin_delete: return Log.logPreferences.Log_RemoveAdmin;
            case LogActionsE.admin_search: return Log.logPreferences.Log_SearchAdmin;
            case LogActionsE.data_export: return Log.logPreferences.Log_ExportData;
            case LogActionsE.data_import: return Log.logPreferences.Log_ImportData;
            case LogActionsE.client_incorporate: return Log.logPreferences.Log_IncorporateClient;
            case LogActionsE.client_update: return Log.logPreferences.Log_UpdateClient;
            case LogActionsE.client_desincorporate: return Log.logPreferences.Log_DesincorporateClient;
            case LogActionsE.client_search: return Log.logPreferences.Log_SearchClient;
        
            case LogActionsE.payment_add: return Log.logPreferences.Log_AddPayment;
            case LogActionsE.payment_search: return Log.logPreferences.Log_SearchPayment;
            case LogActionsE.payment_update: return Log.logPreferences.Log_UpdatePayment;
            case LogActionsE.payment_delete: return Log.logPreferences.Log_RemovePayment;
            
            case LogActionsE.role_update: return Log.logPreferences.Log_UpdateUserRoles;
        }
    }

}