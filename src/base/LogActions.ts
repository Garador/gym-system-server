import {
    LogActions
} from '../models/LogActions';



export default function(): LogActions{

    const logActions                    = new LogActions();
    logActions.Log_AddAdmin             = true;
    logActions.Log_AddPayment           = true;
    logActions.Log_ChangePassword       = true;
    logActions.Log_DesincorporateClient = true;
    logActions.Log_ExportData           = true;
    logActions.Log_ImportData           = true;
    logActions.Log_IncorporateClient    = true;
    logActions.Log_LogOut               = true;
    logActions.Log_Login                = true;
    logActions.Log_RemoveAdmin          = true;
    logActions.Log_RemovePayment        = true;
    logActions.Log_SearchAdmin          = true;
    logActions.Log_SearchClient         = true;
    logActions.Log_SearchPayment        = true;
    logActions.Log_UpdateAdmin          = true;
    logActions.Log_UpdateClient         = true;
    logActions.Log_UpdatePayment        = true;
    logActions.Log_UpdateUserRoles      = true;
    logActions.status = 1;
    return logActions;
}