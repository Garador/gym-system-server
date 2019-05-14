import {DatabaseService} from './databaseAdmin';
import { User } from '../models/User';
import {LogActions as LogCodeAction} from '../enums/Log';
import { LogActions } from '../models/LogActions';
import {LoggingErrors} from '../enums/Errors';

/**
 * Logging provider that allows the storage of the log into the log data.
 */
export class LogProvider {
    private static _instance: LogProvider;
    private logSettings: LogActions;


    constructor(){

    }

    public static get Instance(): LogProvider{
        LogProvider._instance = (LogProvider._instance) ? LogProvider._instance : new LogProvider();
        return LogProvider._instance;
    }

    /**
     * @description Load the actions and updates the logSettings.
     */
    public async loadActions() {
        this.logSettings = await DatabaseService.Instance.connection.getRepository(LogActions).findOne();
    }
    /**
     * 
     * @description Stores a log with the provided information
     * 
     * @param user      User that is activating the action
     * @param action    Enum specifying the action to log
     * @param prevData  Data prior to the update, deletion or creation
     * @param postData  Data after the update, deletion or creation
     */
    public async logAction(user: User, action: LogCodeAction, prevData: string, postData: string){
        if(!user || !user.id || !action){
            throw new Error(LoggingErrors.invalid_parameters+"\n"+JSON.stringify({
                user, action, prevData, postData
            }));
        }
        if(!this.logSettings){
            try{
                await this.loadActions();
                if(
                (this.logSettings == undefined) 
                || (this.logSettings.id)){
                    throw new Error(LoggingErrors.actions_to_log_not_loaded);
                }
            }catch(e){
                console.log(LoggingErrors.actions_to_log_not_loaded);
                throw e;
            }
        }
        switch(action){
            case LogCodeAction.auth_login:
            break;
            case LogCodeAction.auth_logout:
            break;
            case LogCodeAction.auth_changed_password:
            break;
            case LogCodeAction.admin_add:
            break;
            case LogCodeAction.admin_update:
            break;
            case LogCodeAction.admin_delete:
            break;
            case LogCodeAction.admin_search:
            break;
            case LogCodeAction.data_export:
            break;
            case LogCodeAction.data_import:
            break;
            case LogCodeAction.client_incorporate:
            break;
            case LogCodeAction.client_update:
            break;
            case LogCodeAction.client_desincorporate:
            break;
            case LogCodeAction.client_search:
            break;
            case LogCodeAction.payment_add:
            break;
            case LogCodeAction.payment_search:
            break;
            case LogCodeAction.payment_update:
            break;
            case LogCodeAction.payment_delete:
            break;
            case LogCodeAction.role_update:
            break;
            default:
            throw new Error(LoggingErrors.unknown_enum)
        }

    }

    
}