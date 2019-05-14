export interface IRole {
    
    //+Columnas

    canLogin: boolean;                              //Si puede entrar al sistema.
    canChangePassword: boolean;                     //Si puede cambiar SU contraseña.
    canAddAdmin: boolean;                           //Si puede agregar un admin.
    canUpdateAdmin: boolean;                        //Si puede actualizar un admin (incluido contraseña).
    canRemoveAdmin: boolean;                        //Si puede remover un admin
    canSearchAdmin: boolean;                        //Buscar Admins
    canExportData: boolean;                         //Exportar data del sistema
    canImportData: boolean;                         //Importar + Actualizar Data del Sistema
    canIncorporateClient: boolean;                  //Incorporar Data del Cliente
    canUpdateClient: boolean;                       //Actualizar Cliente
    canDesincorporateClient: boolean;               //Desincorporar Cliente
    canSearchClient: boolean;                       //Buscar Cliente
    canAddPayment: boolean;                         //Agregar Pagos
    canUpdatePayment: boolean;                      //Agregar Pagos
    canRemovePayment: boolean;                      //Eliminar Pagos
    canSearchPayment: boolean;                      //Buscar Pagos
    canUpdateUserRoles: boolean;                    //Actualizar Roles de Usuario
}