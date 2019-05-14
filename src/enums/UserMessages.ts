import { LogInResult, SuperAdminUpdateResult, LogOutResult, AdminCreationResult, ClientCreationResult, PaymentAddResult, SuperAdminCreationResult, ClientRemoveResult, ClientRestoreResult, ClientUpdateResult, AdminUpdateResult, AdminRemoveResult, AdminRestoreResult, RoleUpdateResult } from './User';
import { SOCKET_REQUEST_ERROR } from './Socket';

export namespace AuthMessages {
    export const LogIn = {
        [LogInResult.SUCCESS] : "Log In Satisfactorio",
        [LogInResult.INTERNAL_ERROR] : "Error al ingresar. Por favor vuelva a intentarlo nuevamente",
        [LogInResult.INVALID_DATA] : "Datos inválidos. Por favor verifíquelos e intente nuevamente.",
        [LogInResult.INVALID_PASSWORD] : "Contraseña Errónea",
        [LogInResult.USER_DOES_NOT_EXIST] : "Usuario no encontrado",
        [LogInResult.USER_NOT_ACTIVE] : "Usuario no se encuentra con status activo"
    }

    export const LogOut = {
        [LogOutResult.INTERNAL_ERROR]: "Error saliendo del sistema.",
        [LogOutResult.SUCCESS]: "Ha salido del sistema correctamente",
        [LogOutResult.INVALID_TOKEN_PROVIDED]: "Token no correcto proveído"
    }
}

export namespace SuperAdminMessages {
    export const Create = {
        [SuperAdminCreationResult.INVALID_DATA] : "DAtos Invalidos.",
        [SuperAdminCreationResult.INVALID_CREATION] : "Error creando super-admin. Por favor inténtelo más tarde.",
        [SuperAdminCreationResult.USER_ALREADY_EXISTS] : "Super-Admin Ya Creado",
        [SuperAdminCreationResult.SUCCESS] : "Super-Admin Creado"
    }
    export const Update = {
        [SuperAdminUpdateResult.SUCCESS] : "Super-Admin Actualizado",
        [SuperAdminUpdateResult.INVALID_DATA] : "Datos inválidos. Por favor verifíquelos e intente nuevamente.",
        [SuperAdminUpdateResult.USER_NOT_FOUND] : "SuperAdmin no creado aún"
    }
}

export namespace AdminMessages {
    export const Restore = {
        [AdminRestoreResult.INVALID_DATA] : "Datos inválidos. Por favor intentelo denuevo.",
        [AdminRestoreResult.SUCCESS_LOGICAL] : "Admin restaurado satisfactoriamente (Lógicamente)",
        [AdminRestoreResult.SUCCESS_PHYSICAL] : "Admin restaurado satisfactoriamente (Físicamente)",
        [AdminRestoreResult.SUCCESS] : "Admin restaurado satisfactoriamente",
        [AdminRestoreResult.USER_NOT_FOUND] : "El admin no ha sido encontrado"
    }
    export const Remove = {
        [AdminRemoveResult.INVALID_DATA] : "Datos inválidos. Por favor intentelo denuevo.",
        [AdminRemoveResult.SUCCESS_LOGICAL] : "Admin eliminado satisfactoriamente (Lógicamente)",
        [AdminRemoveResult.SUCCESS_PHYSICAL] : "Admin eliminado satisfactoriamente (Físicamente)",
        [AdminRemoveResult.SUCCESS] : "Admin eliminado satisfactoriamente",
        [AdminRemoveResult.USER_NOT_FOUND] : "El admin no ha sido encontrado"
    }
    export const Update = {
        [AdminUpdateResult.INVALID_DATA] : "Datos inválidos. Por favor intentelo denuevo.",
        [AdminUpdateResult.INVALID_CREATION] : "Hubo un problema en la actualización. Por favor, inténtelo más tarde.",
        [AdminUpdateResult.USER_ALREADY_EXISTS] : "Un usuario o cliente con este documento de identidad ya existe",
        [AdminUpdateResult.USER_NOT_FOUND] : "El administrador no ha sido encontrado. Por favor, verifique el documento de identidad.",
        [AdminUpdateResult.SUCCESS] : "Administrador actualizado satisfactoriamente"
    }
    export const Create = {
        [AdminCreationResult.INVALID_DATA] : "Datos inválidos. Por favor intentelo denuevo.",
        [AdminCreationResult.INVALID_CREATION] : "Hubo un problema en la creación. Por favor, inténtelo más tarde.",
        [AdminCreationResult.USER_ALREADY_EXISTS] : "El usuario ya existe",
        [AdminCreationResult.SUCCESS] : "Administrador creado satisfactoriamente"
    }
}

export namespace Role {
    export const Update = {
        [RoleUpdateResult.INTERNAL_ERROR] : "Error interno. Por favor vuélvalo a intentarlo.",
        [RoleUpdateResult.SUCCESS] : "Se ha actualizado el rol del usuario.",
        [RoleUpdateResult.INVALID_DATA] : "Datos no válidos proveídos."
    }
}

export namespace ClientMessages {
    export const Remove = {
        [ClientRemoveResult.INVALID_DATA] : "Datos inválidos. Por favor intentelo denuevo.",
        [ClientRemoveResult.USER_NOT_FOUND] : "El cliente no ha sido encontrado",
        [ClientRemoveResult.SUCCESS_LOGICAL] : "Cliente desincorporado satisfactoriamente (Lógicamente)",
        [ClientRemoveResult.SUCCESS_PHYSICAL] : "Cliente desincorporado satisfactoriamente (Físicamente)",
        [ClientRemoveResult.SUCCESS] : "Cliente desincorporado satisfactoriamente"
    }

    export const Create = {
        [ClientCreationResult.INVALID_DATA] : "Datos inválidos. Por favor intentelo denuevo.",
        [ClientCreationResult.INVALID_CREATION] : "Hubo un problema en la creación. Por favor, inténtelo más tarde.",
        [ClientCreationResult.USER_ALREADY_EXISTS] : "El cliente ya existe - Cédula",
        [ClientCreationResult.SUCCESS] : "Cliente incorporado satisfactoriamente"
    }

    export const Update = {
        [ClientUpdateResult.INVALID_DATA] : "Datos inválidos proveidos",
        [ClientUpdateResult.INVALID_CREATION] : "Problema con la actualización. Por favor, inténtelo más tarde.",
        [ClientUpdateResult.USER_NOT_FOUND] : "Usuario no encontrado.",
        [ClientUpdateResult.SAME_DOCUMENT_ALREADY_EXISTS] : "El mismo documento ya existe.",
        [ClientUpdateResult.SUCCESS] : "Actualizado satisfactoriamente."
    }

    export const Restore = {
        [ClientRestoreResult.INVALID_DATA] : "Datos inválidos. Por favor intentelo denuevo.",
        [ClientRestoreResult.SUCCESS_LOGICAL] : "Cliente reincorporado satisfactoriamente (Lógicamente)",
        [ClientRestoreResult.SUCCESS_PHYSICAL] : "Cliente reincorporado satisfactoriamente (Físicamente)",
        [ClientRestoreResult.SUCCESS] : "Cliente reincorporado",
        [ClientRestoreResult.USER_NOT_FOUND] : "El cliente no ha sido encontrado"
    }
}

export namespace PaymentMessages {
    export const Create = {
        [PaymentAddResult.INVALID_DATA] : "Datos inválidos. Por favor intentelo denuevo.",
        [PaymentAddResult.INVALID_CREATION] : "Hubo un problema en la creación. Por favor, inténtelo más tarde.",
        [PaymentAddResult.CURRENCY_DOES_NOT_EXIST] : "La moneda seleccionada no existe.",
        [PaymentAddResult.USER_NOT_FOUND] : "El cliente no existe - Cédula",
        [PaymentAddResult.SUCCESS] : "El pago ha sido añadido satisfactoriamente"
    }
}

export const SocketRequestErrors = {
    [SOCKET_REQUEST_ERROR.INTERNAL_ERROR] : "SocketRequestErrors: Error Interno",
    [SOCKET_REQUEST_ERROR.INVALID_AUTH] : "SocketRequestErrors: Authenticación Inválida",
    [SOCKET_REQUEST_ERROR.INVALID_DATA] : "SocketRequestErrors: Datos Inválidos",
    [SOCKET_REQUEST_ERROR.INVALID_ROLE] : "SocketRequestErrors: Roles Inválidos"
}

export const ConfigurationUpdate = {
    1: 'La configuración ha sido cambiada. Por favor, reinicie el cliente.',
    2: 'Error. La configuración no pudo ser cambiada.',
}

export namespace DialogMessages {
    
    export enum CONSULT_CLIENT {
        CLIENT_NOT_FOUND = '<p class="uk-modal-body">El cliente no ha sido encontrado.</p>'
    }
    
    export enum CREATE_PAYMENT {
        CLIENT_NOT_FOUND = '<p class="uk-modal-body">El cliente no ha sido encontrado.</p>'
    }

    export enum DESINCORPORATE_CLIENT {
        ALREADY_DESINCORPORATED = '<p class="uk-modal-body">El usuario ya ha sido desincorporado.</p>',
        CONFIRM = '<p class="uk-modal-body">¿Desea eliminar al cliente con nombre: ${1}?</p>',
        NOT_FOUND = '<p class="uk-modal-body">Cliente no encontrado.</p>'
    }

    export enum REMOVE_ADMIN {
        ALREADY_DESINCORPORATED = '<p class="uk-modal-body">El administrador ya ha sido eliminado.</p>',
        CONFIRM = '<p class="uk-modal-body">¿Desea eliminar al administrador con nombre: ${1}?</p>',
        NOT_FOUND = '<p class="uk-modal-body">Administrador no encontrado.</p>'
    }

    export enum RESTORE_ADMIN {
        ALREADY_RESTORED = '<p class="uk-modal-body">El administrador ya ha sido restaurado.</p>',
        CONFIRM = '<p class="uk-modal-body">¿Desea restaurar al administrador con nombre: ${1}?</p>',
        NOT_FOUND = '<p class="uk-modal-body">Administrador no encontrado.</p>'
    }

    export enum RESTORE_DATA {
        SUCCESS = '<p class="uk-modal-body">Restauración completada. Por favor, reinicie el cliente.</p>',
        ERROR = '<p class="uk-modal-body">ERROR: La restauración no pudo ser completada con éxito.</p>'
    }

    export enum UPDATE_ADMIN {
        NOT_FOUND = '<p class="uk-modal-body">Administrador no encontrado. Por favor, verifique el documento de identidad.</p>'
    }

    export enum RESTORE_CLIENT {
        ALREADY_RESTORED = '<p class="uk-modal-body">El cliente ya ha sido restaurado.</p>',
        CONFIRM = '<p class="uk-modal-body">¿Desea restaurar al cliente con nombre: ${1}?</p>',
        NOT_FOUND = '<p class="uk-modal-body">Cliente no encontrado.</p>'
    }

    export enum UPDATE_CLIENT {
        NOT_FOUND = '<p class="uk-modal-body">Cliente no encontrado.</p>'
    }

    export enum LOAD_USER_COMPONENT {
        NOT_FOUND_CLIENT = '<p class="uk-modal-body">Cliente no encontrado.</p>'
        ,NOT_FOUND_ADMIN = '<p class="uk-modal-body">Administrador no encontrado.</p>'
    }

    export enum REMOVE_BACKUP {
        CONFIRM = '<p class="uk-modal-body">¿Desea eliminar el archivo con nombre: ${1}?</p>',
        REMOVE_SUCCESS = '<p class="uk-modal-body">Archivo eliminado con éxito</p>',
        REMOVE_ERROR = '<p class="uk-modal-body">Sucedió un error al tratar de eliminar el achivo. Por favor, elimínelo manualmente.</p>'
    }

    export enum SOCKET_ERROR {
        CLIENT_NOT_CONNECTED = '<p class="uk-modal-body">Cliente no conectado al servidor.</p>'
    }
}