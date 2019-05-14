export enum SOCKET_CALL_ROUTES {
    //Reservadas para Administrador Superior
    SUPER_ADMIN_ADD = "super:admin:add",                //Agregar Super-Administrador
    SUPER_ADMIN_UPDATE = "super:admin:update",          //Actualizar Super-Administrador
    SUPER_ADMIN_REMOVE = "super:admin:remove",          //Eliminar Super-Administrador
    //Rutas relacionadas con super-administradores
    SUPER_ADMIN_GET = "super:admin:get",                //Obtener Super-Administrador(es)

    //Rutas relacionadas con Autenticación
    AUTH_LOGIN = "auth:login",                          //Obtener Token / Entrar al Sistema
    AUTH_LOGOUT = "auth:logout",                        //Deshabilitar Login / Salir del Sistema

    //Rutas relacionadas con administrador
    ADMIN_ADD = "admin:add",                            //Agregar un nuevo administrador
    ADMIN_GET = "admin:get",                            //Obtener administradores
    ADMIN_UPDATE = "admin:update",                      //Actualizar un administrador
    ADMIN_REMOVE = "admin:remove",                      //Remover un administrador
    ADMIN_RESTORE = "admin:restore",                    //Restaurar un administrador
    ADMIN_SEARCH = "admin:search",                      //Búsqueda de Admins


    LOG_SEARCH = "log:get",


    PERSONAL_PROFILE_GET = "me:user:get",               //Handle personal profile get

    //Rutas relacionadas con roles
    UPDATE_ROLE = "role:update",                        //Actualiza el rol de un usuario determinado
    BASE_ROLE_GET = "role:base:get",                    //Obtiene los roles base
    
    //Rutas relacionadas con los clientes
    CLIENT_ADD = "client:incorporate",                  //Incorporación de Cliente
    CLIENT_GET = "client:get",                          //Buscar / Obtener Clientes
    CLIENT_UPDATE = "client:update",                    //Actualizar Cliente
    CLIENT_REMOVE = "client:desincorporate",            //Desincorporación de Cliente
    CLIENT_RESTORE = "client:restore",                  //Reincorporar
    CLIENT_SEARCH = "client:search",                    //Búsqueda de Usuarios
    
    CLIENT_PAYMENT_ADD = "client:payment:add",          //Agregar Pago
    CLIENT_PAYMENT_GET = "client:payment:get",          //Ver Pagos
    CLIENT_PAYMENT_SEARCH = "client:payment:search",    //Búsqueda de Usuarios
    CLIENT_PAYMENT_UPDATE = "client:payment:update",    //Actualizar Pagos
    CLIENT_PAYMENT_REMOVE = "client:payment:remove",    //Eliminar Pago (DESHABILIDATO)

    CLIENT_CONTACT_ADD = "client:contact:add",          //Agregar contacto
    CLIENT_CONTACT_GET = "client:contact:get",          //Ver contactos
    CLIENT_CONTACT_UPDATE = "client:contact:update",    //Actualizar contactos
    CLIENT_CONTACT_REMOVE = "client:contact:remove",    //Eliminar contacto (DESHABILIDATO)

    //Relacionadas a la información de la empresa
    COMPANY_GET = "company:get",                        //Obtener información de la compañía
    COMPANY_UPDATE = "company:update",                  //Actualizar la compañía
    
    //Relacionadas con la moneda
    CURRENCY_GET = "currency:get",                      //Obtener Moneda
    CURRENCY_ADD = "currency:add",                      //Agregar Moneda
    CURRENCY_REMOVE = "currency:remove",                //Eliminar Moneda

    //Relacionadas con el tipo de contacto
    PAYMENT_METHOD_GET = "payment:method:get",          //Obtener métodos de pago
    PAYMENT_METHOD_ADD = "payment:method:add",          //Agregar un método de pago

    //Relacionadas con el tipo de contacto
    DOCUMENT_TYPE_GET = "document:type:get",          //Obtener tipos de documento

    //Acciones relacionadas con importar / exportar data
    DATA_EXPORT = "data:export",
    DATA_IMPORT = "data:import",
    DATA_EXPORT_LIST_REQUEST = "data:export:list",
    DATA_EXPORT_REMOVE_REQUEST = "data:export:remove",
    DATA_IMPORT_FILE_UPLOAD = "data:improt:file_upload",

    //Others
    PING_REQUEST = "PING",
    DISCONNECTED = "disconnected",
    CONNECTED = "connect"
}

export enum CONNECTION_PARAMETERS {
    PORT = 8036,
    HOST = "http://0.0.0.0"
}

export enum SOCKET_REQUEST_ERROR { 
    INVALID_AUTH    = "invalidAuthorization",
    INVALID_ROLE    = "invalidRolePermission",
    INTERNAL_ERROR  = "internalError",
    INVALID_DATA    = "invalidSocketData"
}