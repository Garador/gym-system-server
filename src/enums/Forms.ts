export enum FORM_FORMATS {
    DATE = "DD/MM/YYYY"
}

export namespace SearchOptions {
    export enum DATE {
        GREATHER_THAN = "Mayor A",
        LESSER_THAN = "Menor A",
        EQUAL_TO = "Igual A",
    }
    export enum PAYMENT {
        GREATHER_THAN = "Mayor A",
        LESSER_THAN = "Menor A",
        EQUAL_TO = "Igual A",
    }

    export enum STATUS {
        DELETED = "Eliminado",
        ACTIVE = "Activo"
        //,SUSPENDED = 2
    }

    export enum LOG_ACTION {
        super_admin_creation = "Creación de SuperAdmin",
        super_admin_update = "Actualización de SuperAdmin",

        auth_login = "Entrada al Sistema",
        auth_logout = "Salida del Sistema",
        auth_changed_password = "Cambiada Contraseña",

        admin_add = "Agregado Administrador",
        admin_update = "Actualizado Adminstrador",
        admin_delete = "Eliminado Administrador",
        //admin_search = "Buscado Administrador",

        data_export = "Exportado Data",
        data_import = "Importado Data",

        client_incorporate = "Incorporado Cliente",
        client_update = "Actualizado Cliente",
        client_desincorporate = "Desincorporado Cliente",
        //client_search = "Buscado Cliente",

        payment_add = "Agregado Pago",
        //payment_search = "Buscado Pago",
        //payment_update = "Actualizado Pago",
        //payment_delete = "Eliminado Pago",
        
        role_update = "Actualizado Rol"
        //,SUSPENDED = 2
    }

    export enum STATUS_ADMIN {
        DELETED = "Eliminado",
        ACTIVE = "Activo"
        //,SUSPENDED = 2
    }
}