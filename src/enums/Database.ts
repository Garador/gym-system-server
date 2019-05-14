export namespace TableNames {

    export enum Metadata {
        createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",
            version = "version"
    }

    export enum Document {
        table_name = "documento",
            id = "documento",
            prefix = "prefijo",
            content = "contenido",
            image = "imagen",

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",

            foreign_key_user = "usuario"
    }

    export enum Jwt {
        table_name = "jwt",
            id = 'jwt',

            token = "token",

            expireAt = "expira",

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",

            foreign_key_user = "usuario"
    }

    export enum User {
        table_name = 'usuario',
            id = 'usuario',

            name = "nombre",
            surname = "apellido",

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",
            loggedin = "loggedin",
            phone = "telefono",
            address = "direccion",

            foreign_key_role = 'rol',
            foreign_key_document = 'documento',
            foreign_key_user = 'usuario',
            foreign_key_jwt = 'jwt',
            foreign_key_membership = 'membresia',
            foreign_key_login = "login"
    }

    export enum Login {
        table_name = "login",
            id = 'login',

            username = "nombre_usuario",
            salt = 'salt',
            hash = 'hash',
            algorithm = 'algoritmo',

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",

            foreign_key_user = 'usuario'
    }

    export enum Role_base {
        table_name = "rol_base",
            id = 'rol_base',

            //Específicos de tabla base
            role_name = "nombre",

            //Auth
            auth_login = "auth_login",
            auth_change_password = "auth_cambiar_password",

            admin_add = "admin_agregar",
            admin_update = "admin_modificar",
            admin_remove = "admin_eliminar",
            admin_search = "admin_buscar", //PRELACIÓN =  No puede buscar ningún otro admin que no sea él mismo.
            //Data del Sistema
            data_export = "data_exportar",
            data_import = "data_importar",
            //Cliente
            client_incorporate = "cliente_incorporar",
            client_udpate = "cliente_modificar",
            client_desincorporate = "cliente_desincorporar",
            client_search = "cliente_buscar",
            //Pago
            payment_add = "pago_agregar",
            payment_search = "pago_buscar",
            payment_update = "pago_actualizar",
            payment_remove = "pago_eliminar",

            role_update = "rol_actualizar", //Actualizar los roles de los usuarios en particular

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",
            version = "version"
    }

    export enum Role {
        table_name = "rol",
            id = 'rol',
            //Auth
            canLogin = "auth_login",
            canChangePassword = "auth_cambiar_password",
            canAddAdmin = "admin_agregar",
            canUpdateAdmin = "admin_modificar",
            canRemoveAdmin = "admin_eliminar",
            canSearchAdmin = "admin_buscar",
            //Data del Sistema
            canExportData = "data_exportar",
            canImportData = "data_importar",
            //Cliente
            canIncorporateClient = "cliente_incorporar",
            canUpdateClient = "cliente_modificar",
            canDesincorporateClient = "cliente_desincorporar",
            canSearchClient = "cliente_buscar",
            //Pago
            canAddPayment = "pago_agregar",
            canSearchPayment = "pago_buscar",
            canUpdatePayment = "pago_actualizar",
            canRemovePayment = "pago_eliminar",
            //Roles
            canUpdateUserRoles = "rol_actualizar", //Actualizar los roles de los usuarios en particular

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",

            foreign_key_user = 'usuario',

            foreign_key_base_role = 'rol_base'
    }

    export enum LogActions {
        table_name = "acciones_para_log",
            id = "acciones_para_log",

            //Auth
            auth_login = "auth_login",
            auth_logout = "auth_logout",
            auth_change_password = "auth_change_password",
            //Admin
            admin_add = "admin_agregar",
            admin_update = "admin_modificar",
            admin_remove = "admin_eliminar",
            admin_search = "admin_buscar", //PRELACIÓN =  No puede buscar ningún otro admin que no sea él mismo.
            //Data del Sistema
            data_export = "data_exportar",
            data_import = "data_importar",
            //Cliente
            client_incorporate = "cliente_incorporar",
            client_udpate = "cliente_modificar",
            client_desincorporate = "cliente_desincorporar",
            client_search = "cliente_buscar",
            //Pago
            payment_add = "pago_agregar",
            payment_search = "pago_buscar",
            payment_update = "pago_actualizar",
            payment_remove = "pago_eliminar",

            role_update = "rol_actualizar", //Actualizar los roles de los usuarios en particular

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",
            version = "version"
    }

    export enum Log {
        table_name = "log",
            id = "log",

            //Auth
            action_performed = "accion",

            event_time = "tiempo_evento",

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",

            foreign_key_user = 'usuario'
    }

    export enum LogContent {
        table_name = "log_contenido",
            id = "log_contenido",

            //Auth
            previous_value = "valor_previo",
            log_id = "log",
            next_value = "valor_nuevo",

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",

            foreign_key_user = 'usuario'
    }

    export enum Membership {
        table_name = "membresia",
            id = "membresia",

            cut_date = "fecha_corte",
            inscription_date = "fecha_inscripcion",
            month_ammount = "monto_mes",

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",

            foreign_key_company = "company",
            foreign_key_user = "usuario"
    }

    export enum Company {
        table_name = "company",
            id = "company",

            description = "descripcion",
            name = "nombre",

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",
    }

    export enum Payment {
        table_name = "pago",
            id = "pago",

            ammount = "cantidad",
            notes = "notas",
            payment_method = "metodo_pago",

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",

            foreign_key_currency = "moneda",
            foreign_key_membership = "membresia"
    }

    /**
     * name =  CurrencyNames.iso_4217
    name =  CurrencyNames.decimals
    name =  CurrencyNames.display_name
     */
    export enum Currency {
        table_name = "moneda",
            id = "moneda",

            iso_4217 = 'iso_4217',
            decimals = 'decimales',
            display_name = 'nombre',

            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",

            foreign_key_currency = "moneda",
            foreign_key_membership = "membresia"
    }

    export enum UserContact {
        table_name = "contacto_usuario",
            id = "contacto_usuario",

            content = 'contenido',
            type = 'tipo',


            createdAt = "creado",
            updatedAt = "actualizado",
            status = "status",

            foreign_key_user = "usuario"
    }

    export enum Configuration {
        table_name = "configuration",
        id = "configuration",

        socket_host = 'host_socket',
        socket_port = 'host_puerto',

        createdAt = "creado",
        updatedAt = "actualizado",
        status = "status"
    }
}

//JSON to Class Mapping
export namespace TableMapping {

    export enum Role_base {
        id = TableNames.Role_base.id,
            createdAt = TableNames.Role_base.createdAt,
            updatedAt = TableNames.Role_base.updatedAt,
            status = TableNames.Role_base.status,
            version = TableNames.Role_base.version,
            name = TableNames.Role_base.role_name,

            canLogin = TableNames.Role_base.auth_login,
            canChangePassword = TableNames.Role_base.auth_change_password,
            canAddAdmin = TableNames.Role_base.admin_add,
            canUpdateAdmin = TableNames.Role_base.admin_update,
            canRemoveAdmin = TableNames.Role_base.admin_remove,
            canSearchAdmin = TableNames.Role_base.admin_search,
            canExportData = TableNames.Role_base.data_export,
            canImportData = TableNames.Role_base.data_import,
            canIncorporateClient = TableNames.Role_base.client_incorporate,
            canUpdateClient = TableNames.Role_base.client_udpate,
            canDesincorporateClient = TableNames.Role_base.client_desincorporate,
            canSearchClient = TableNames.Role_base.client_search,
            canAddPayment = TableNames.Role_base.payment_add,
            canUpdatePayment = TableNames.Role_base.payment_update,
            canRemovePayment = TableNames.Role_base.payment_remove,
            canSearchPayment = TableNames.Role_base.payment_search,
            canUpdateUserRoles = TableNames.Role_base.role_update
    }

    export enum Currency {
        id = TableNames.Currency.id,
            createdAt = TableNames.Currency.createdAt,
            updatedAt = TableNames.Currency.updatedAt,
            status = TableNames.Currency.status,
            isoCode = TableNames.Currency.iso_4217,
            decimals = TableNames.Currency.decimals,
            displayName = TableNames.Currency.display_name
    }

    export enum Company {
        id = TableNames.Company.id,
            createdAt = TableNames.Company.createdAt,
            updatedAt = TableNames.Company.updatedAt,
            status = TableNames.Company.status,
            description = TableNames.Company.description,
            name = TableNames.Company.name
    }
}

export namespace TableAlias {
    export enum User {
        MAIN = "user",
        USER_DOCUMENT_PROP = "user.document", USER_DOCUMENT_ALIAS = "user_document"

            , USER_MEMBERSHIP_PROP = "user.membership", USER_MEMBERSHIP_ALIAS = "user_membership"

            , USER_ROLE_PROP = "user.role", USER_ROLE_ALIAS = "user_role"

            , USER_JWT_PROP = "user.jwt", USER_JWT_ALIAS = "user_jwt"

            , USER_LOGIN_PROP = "user.login", USER_LOGIN_ALIAS = "user_login"

            , USER_LOGS_PROP = "user.logs", USER_LOGS_ALIAS = "user_logs"
    }
    export enum Log {
        MAIN = "log"
    }
    export enum LogContent {
        MAIN = "log_content"
    }

    export enum Membership {
        MAIN = "membership"
    }

    export enum Role {
        MAIN = "role"
    }

    export enum Jwt {
        MAIN = "jwt"
    }

    export enum Login {
        MAIN = "login"
    }

    export enum Document {
        MAIN = "document"
    }

    export enum Payment {
        MAIN = "payment"
    }

    export enum Currency {
        MAIN = "currency"
    }
}



export enum DB_FILE_LOC {

    database_test_audit = "_RP_db_PS_main_PS_test_audit.sqlite"
    ,database_test_main = "_RP_db_PS_main_PS_test_main.sqlite"
    ,database_prod_audit = "_RP_db_PS_main_PS_prod_audit.sqlite"
    ,database_prod_main = "_RP_db_PS_main_PS_prod_main.sqlite"



    ,database_client_test_audit = "db_PS_main_PS_test_audit.sqlite"
    ,database_client_test_main = "db_PS_main_PS_test.sqlite"
    ,database_client_prod_audit = "db_PS_main_PS_prod.main.sqlite"
    ,database_client_prod_main = "db_PS_main_PS_prod.main.sqlite"
    ,RP = "_RP_"
    ,PS = "_PS_"
}

export enum DATABASE_SERVICE_EVENTS {
    SERVICE_LOADED = "SERVICE_LOADED",
    SERVICE_LOADING_FAIL = "SERVICE_LOADING_FAIL",
}

export enum DATABASE_MODEL_EVENTS {
    MODEL_UPDATED = "MODEL_UPDATED"
}

export enum SORT_OPTIONS {
    ASC= 'ASC',
    DESC = 'DESC'
}