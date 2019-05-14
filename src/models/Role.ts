import { Entity, UpdateDateColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import {TableNames} from '../enums/Database';
import {ITableMetadata} from '../interfaces/TableStructure';
import {IRole} from '../interfaces/Role';
import {BaseRole} from './BaseRole';
import { toJson } from "../interfaces/Socket";


@Entity({
    name: TableNames.Role.table_name
})
export class Role implements ITableMetadata, IRole {

    [index:string]: any;

    //+Metadata
    @PrimaryGeneratedColumn({
    //@PrimaryColumn({
        name:TableNames.Role.id
    })
    id: number;

    @CreateDateColumn({
        name:TableNames.Role.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name:TableNames.Role.updatedAt
    })
    updatedAt: Date;

    @Column({
        name:TableNames.Role.status
    })
    status: number;
    //-Metadata
    
    //+Columnas

    @Column({
        name:TableNames.Role.canLogin
    })
    canLogin: boolean;                              //Si puede entrar al sistema.

    @Column({
        name:TableNames.Role.canChangePassword
    })
    canChangePassword: boolean;                              //Si puede entrar al sistema.

    @Column({
        name:TableNames.Role.canAddAdmin
    })
    canAddAdmin: boolean;                           //Si puede agregar un admin.

    @Column({
        name:TableNames.Role.canUpdateAdmin
    })
    canUpdateAdmin: boolean;                        //Si puede actualizar un admin.

    @Column({
        name:TableNames.Role.canRemoveAdmin
    })
    canRemoveAdmin: boolean;                        //Si puede remover un admin

    @Column({
        name:TableNames.Role.canSearchAdmin
    })
    canSearchAdmin: boolean;                        //Buscar Admins

    @Column({
        name:TableNames.Role.canExportData
    })
    canExportData: boolean;                         //Exportar data del sistema

    @Column({
        name:TableNames.Role.canImportData
    })
    canImportData: boolean;                         //Importar + Actualizar Data del Sistema

    @Column({
        name:TableNames.Role.canIncorporateClient
    })
    canIncorporateClient: boolean;                  //Incorporar Data del Cliente

    @Column({
        name:TableNames.Role.canUpdateClient
    })
    canUpdateClient: boolean;                       //Actualizar Cliente

    @Column({
        name:TableNames.Role.canDesincorporateClient
    })
    canDesincorporateClient: boolean;               //Desincorporar Cliente

    @Column({
        name:TableNames.Role.canSearchClient
    })
    canSearchClient: boolean;                       //Buscar Cliente

    @Column({
        name:TableNames.Role.canAddPayment
    })
    canAddPayment: boolean;                         //Agregar Pagos

    @Column({
        name:TableNames.Role.canUpdatePayment
    })
    canUpdatePayment: boolean;                         //Agregar Pagos

    @Column({
        name:TableNames.Role.canRemovePayment
    })
    canRemovePayment: boolean;                         //Eliminar Pagos

    @Column({
        name:TableNames.Role.canSearchPayment
    })
    canSearchPayment: boolean;                      //Buscar Pagos

    @Column({
        name:TableNames.Role.canUpdateUserRoles
    })
    canUpdateUserRoles: boolean;                    //Actualizar Roles de Usuario
    
    //-Columnas
    //+Lláves Foráneas
    @OneToOne(type => User, user => user.role)
    @JoinColumn({
        name:TableNames.Role.foreign_key_user
    })
    user:User;                                      //Usuario

    @ManyToOne(type => BaseRole, baseRole => baseRole.roles)
    @JoinColumn({
        name:TableNames.Role.foreign_key_base_role
    })
    baseRole: BaseRole;
    //-Lláves Foráneas

    toJson(): toJson.IRole{
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            canAddAdmin: this.canAddAdmin,
            canAddPayment: this.canAddPayment,
            canChangePassword: this.canChangePassword,
            canDesincorporateClient: this.canDesincorporateClient,
            canExportData: this.canExportData,
            canImportData: this.canImportData,
            canIncorporateClient: this.canIncorporateClient,
            canLogin: this.canLogin,
            canRemoveAdmin: this.canRemoveAdmin,
            canRemovePayment: this.canRemovePayment,
            canSearchAdmin: this.canSearchAdmin,
            canSearchClient: this.canSearchClient,
            canSearchPayment: this.canSearchPayment,
            canUpdateAdmin: this.canUpdateAdmin,
            canUpdateClient: this.canUpdateClient,
            canUpdatePayment: this.canUpdatePayment,
            canUpdateUserRoles: this.canUpdateUserRoles,
            user: this.user ? this.user.id : null,
            baseRole: (this.baseRole instanceof BaseRole) ? this.baseRole.id : null
        }
    }


    public copyBaseRole(base: BaseRole){
        this.canAddAdmin                = base.canAddAdmin;
        this.canAddPayment              = base.canAddPayment;
        this.canChangePassword          = base.canChangePassword;
        this.canDesincorporateClient    = base.canDesincorporateClient;
        this.canExportData              = base.canExportData;
        this.canImportData              = base.canImportData;
        this.canIncorporateClient       = base.canIncorporateClient;
        this.canLogin                   = base.canLogin;
        this.canRemoveAdmin             = base.canRemoveAdmin;
        this.canRemovePayment           = base.canRemovePayment;
        this.canSearchAdmin             = base.canSearchAdmin;
        this.canSearchClient            = base.canSearchClient;
        this.canSearchPayment           = base.canSearchPayment;
        this.canUpdateAdmin             = base.canUpdateAdmin;
        this.canUpdateClient            = base.canUpdateClient;
        this.canUpdatePayment           = base.canUpdatePayment;
        this.canUpdateUserRoles         = base.canUpdateUserRoles;

        this.baseRole = base;
    }

}