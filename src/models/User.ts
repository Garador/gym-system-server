import {
    OneToOne,
    PrimaryGeneratedColumn,
    JoinColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    Entity,
    SelectQueryBuilder,
    BeforeInsert,
    BeforeUpdate
} from 'typeorm';
//Enums & Interfaces
import {
    TableNames,
    TableAlias
} from '../enums/Database';
import {
    ITableMetadata
} from '../interfaces/TableStructure';
import {
    ISuperAdminCreationPayload,
    ISuperAdminCreationResult,
    ILogOutResult,
    ILogInResult,
    IAdminCreationPayload,
    IAdminCreationResult,
    IClientCreationPayload,
    IClientCreationResult,
    ISuperAdminUpdateResult,
    ISuperAdminUpdatePayload,
    IAdminUpdatePayload,
    IAdminUpdateResult,
    IClientUpdatePayload,
    IClientUpdateResult,
    IPaymentAddPayload,
    IPaymentAddResult,
    IRoleUpdatePayload,
    IRoleUpdateResult,
    IAdminRemoveResult,
    IClientRemoveResult,
    IClientRestoreResult,
    IAdminRestoreResult,
    IUserSearchOptions
} from '../interfaces/User';
import {
    LogInResult,
    LogOutResult,
    SuperAdminCreationResult,
    AdminCreationResult,
    ClientCreationResult,
    SuperAdminUpdateResult,
    AdminUpdateResult,
    ClientUpdateResult,
    PaymentAddResult,
    RoleUpdateResult,
    OperationError,
    AdminRemoveResult,
    ClientStatus,
    SuperAdminStatus,
    AdminStatus,
    ClientRemoveResult,
    ClientRestoreResult,
    AdminRestoreResult,
    UserSearchResultMode
} from '../enums/User';
import {
    BASE_ROLE_IDS
} from '../enums/Roles';
//Providers
import {
    DatabaseService
} from '../providers/databaseAdmin';
import {
    PasswordManager
} from '../providers/PasswordManager';
import {
    ETokenVerifyResult,
    ITokenInternalContent,
    ITokenInterface
} from '../interfaces/PasswordManager';
//Models
import {
    Login
} from './Login';
import {
    Jwt
} from './Jwt';
import {
    Document as Doc
} from './Document';
import {
    Role
} from './Role';
import {
    Membership
} from './Membership';
import {
    Log
} from './Log';
import {
    UserContact
} from './UserContact';
//TypeORM
import {
    Repository
} from 'typeorm';
import {
    SyntaxValidationProvider, UserSearchValidator
} from '../providers/SyntaxValidationProvider';
import {
    BaseRole
} from './BaseRole';
import {
    Company
} from './Company';
//Others
import * as moment from 'moment';
import {
    Payment
} from './Payment';
import {
    Currency
} from './Currency';
import {
    LogActions
} from '../enums/Log';
import { RoleStatus } from '../enums/Role';
import { MembershipStatus } from '../enums/Membership';
import { DocumentStatus } from '../enums/Document';
import { PaymentStatus } from '../enums/Payment';
import { JWTStatus } from '../enums/Jwt';
import { LoginStatus } from '../enums/Login';
import { SearchProvider } from '../providers/SearchProvider';
import { toJson } from '../interfaces/Socket';
import { DOCUMENT_PREFIXES } from '../base/DocumentPrefixes';

@Entity({
    name: TableNames.User.table_name
})
export class User implements ITableMetadata {    

    //+Metadata
    @PrimaryGeneratedColumn({
        //@PrimaryColumn({
        name: TableNames.User.id
    })
    id: number;

    @CreateDateColumn({
        name: TableNames.User.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: TableNames.User.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.User.status
    })
    status: number;
    //-Metadata

    //+Datos de la tabla
    @Column({
        name: TableNames.User.name,
        length: 60
    })
    firstName: string;
    
    @Column({
        name: TableNames.User.phone,
        length: 20,
        nullable: true
    })
    phone: string;

    @Column({
        name: TableNames.User.address,
        length: 300,
        nullable: true
    })
    address: string;

    @Column({
        name: TableNames.User.surname,
        length: 60,
        nullable: true
    })
    surName: string;
    //-Datos de la tabla
    //+Llaves Foráneas
    @OneToOne(type => Doc, document => document.user, {
        nullable: true,
        cascade: ['insert', 'update']
    })
    @JoinColumn({
        name: TableNames.User.foreign_key_document
    })
    document: Doc; //Documento de Identidad

    @OneToOne(type => Login, login => login.user, {
        nullable: true,
        cascade: ['insert', 'update']
    })
    @JoinColumn({
        name: TableNames.User.foreign_key_login
    })
    login: Login; //Login

    @OneToOne(type => Jwt, jwt => jwt.user, {
        nullable: true,
        cascade: ['insert', 'update']
    })
    @JoinColumn({
        name: TableNames.User.foreign_key_jwt
    })
    jwt: Jwt; //JWT

    @OneToOne(type => Role, role => role.user, {
        nullable: true,
        cascade: ['insert', 'update']
    })
    @JoinColumn({
        name: TableNames.User.foreign_key_role
    })
    role: Role; //ID del rol al que pertenece

    @OneToOne(type => Membership, membership => membership.user, {
        nullable: true,
        cascade: ['insert', 'update']
    })
    @JoinColumn({
        name: TableNames.User.foreign_key_membership
    })
    membership: Membership;
    //-Llaves  Foráneas

    //Relaciones
    @OneToMany(type => Log, log => log.user)
    logs: Log[];

    @OneToMany(type => UserContact, contact => contact.user)
    contacts: UserContact[];
    //-Relaciones

    public async loadLogs(paging?:{skip?:number, take?:number}){
        if(this.id){
            this.logs = await DatabaseService.Instance.connection.getRepository(Log)
            .find({
                where:{
                    user:this
                }
                ,take: (paging && paging.take) ? paging.take : 0
                ,skip: (paging && paging.skip) ? paging.skip : 0
            });
        }
    }

    public toJson(): toJson.IUser{
        return {
            firstName: this.firstName,
            surName: this.surName,
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            status: this.status,
            address: this.address,
            phone: this.phone,
            document: (this.document instanceof Doc) ? this.document.toJson(): this.document,
            role: (this.role instanceof Role) ? this.role.toJson(): this.role,
            login: (this.login instanceof Login) ? this.login.toJson() : this.login,
            membership: (this.membership instanceof Membership) ? this.membership.toJson() : this.membership
        }
    }

    /**
     * @param username User name
     * @param rawPassword Un-obfuscated password
     * @implements ITokenInterface
     * @returns Generates (or updates) and stores a new user access token.
     */
    public static async logIn(username: string, rawPassword: string): Promise < ILogInResult > {
        try {
            if (!SyntaxValidationProvider.Instance.validatePassword(username) ||
                !SyntaxValidationProvider.Instance.validateUsername(rawPassword)) {
                return {
                    logIn: false,
                    data: null,
                    code: LogInResult.INVALID_DATA
                };
            }
            let user:User = <any>(await User.searchUser({
                where:{
                    login:{
                        content:{
                            username:{
                                equal: username
                            }
                        }
                    }
                },
                includedRelations:['jwt','role','user','login']
            }, UserSearchResultMode.ENTITIES))[0];

            if (user instanceof User) {
                if(
                    ((user.status == SuperAdminStatus.ACTIVE)
                    ||
                    (user.status == ClientStatus.ACTIVE)
                    ||
                    (user.status == AdminStatus.ACTIVE)) == false
                    || !(user.role.canLogin)
                ){
                    console.log(`
                    
                    ((user.status == SuperAdminStatus.ACTIVE): ((${user.status} == ${SuperAdminStatus.ACTIVE})

                    ((user.status == ClientStatus.ACTIVE): ((${user.status} == ${ClientStatus.ACTIVE})

                    ((user.status == AdminStatus.ACTIVE): ((${user.status} == ${AdminStatus.ACTIVE})

                    (user.role.canLogin): (${user.role.canLogin})
                    
                    
                    `);
                    return {
                        logIn: false,
                        data: null,
                        code: LogInResult.USER_NOT_ACTIVE
                    };
                }
                let previousToken = user.jwt ? user.jwt.token : null;
                if (user.login.hasPassword(rawPassword)) {
                    //Generate + Store / Update JWT
                    try {
                        let tokenResult = await user.updateJWT();
                        await Log.logAction(user, {
                            action: LogActions.auth_login,
                            previousValue: (() => {
                                let prevVal = null;
                                if(previousToken){
                                    let tokenResult = PasswordManager.verifyJWToken(previousToken);
                                    if((<ITokenInternalContent>tokenResult.data).exp){
                                        prevVal = JSON.stringify(tokenResult);
                                    }
                                }
                                return prevVal;
                            })(),
                            newValue: ((): string => {
                                let stringifyPayload = JSON.parse(JSON.stringify(tokenResult));
                                stringifyPayload.jwt.token = "ommited";
                                stringifyPayload.token = "ommited";
                                return JSON.stringify(stringifyPayload)
                            })(),
                            actionTime: new Date()
                        });
                        return {
                            logIn: true,
                            data: tokenResult,
                            code: LogInResult.SUCCESS
                        };
                    } catch (e) {
                        console.log(`
                        
                        
                        LogIn INTERNAL ERROR #1:
                        `,e);
                        return {
                            logIn: false,
                            data: e,
                            code: LogInResult.INTERNAL_ERROR
                        };
                    }
                } else {
                    return {
                        logIn: false,
                        data: null,
                        code: LogInResult.INVALID_PASSWORD
                    };
                }
            } else {
                return {
                    logIn: false,
                    data: null,
                    code: LogInResult.USER_DOES_NOT_EXIST
                };
            }
        } catch (e) {
            console.log(`
            

            LogIn INTERNAL ERROR #1:
            `,e);
            return {
                logIn: false,
                data: e,
                code: LogInResult.INTERNAL_ERROR
            };
        }
    }

    /**
     * @description Updates a user JWT on the databas and disables it
     * @param jwt The JWT to invalidate
     */
    public static async logOut(jwt: string): Promise < ILogOutResult > {
        let verifyResult = PasswordManager.verifyJWToken(jwt);
        switch (verifyResult.code) {
            case ETokenVerifyResult.Success:
                //DatabaseService.Instance.connection.getRepository(Jwt).find()
                let tokenI: ITokenInternalContent = < ITokenInternalContent > verifyResult.data;
                let user: User = await User.getByID(tokenI.user.id, ['jwt']);
                let previousToken = "";
                if (user.jwt) {
                    previousToken = user.jwt.token;
                    user.jwt.status = JWTStatus.LOGGED_OUT;
                    user.jwt.token = "LOGGED_OUT";
                    user.jwt.user = user;
                    await DatabaseService.Instance.connection.getRepository(Jwt).save(<any>user.jwt);
                }

                await Log.logAction(user, {
                    action: LogActions.auth_logout,
                    previousValue: (() => {
                        return JSON.stringify({
                            token: previousToken
                        })
                    })(),
                    newValue: ((): string => {
                        let stringifyPayload = "";
                        try {
                            stringifyPayload = JSON.stringify(user.jwt);
                        } catch (e) {
                            if (user.jwt) {
                                stringifyPayload = JSON.stringify({
                                    status: user.jwt.status,
                                    token: user.jwt.token,
                                    id: user.jwt.id,
                                    createdAt: user.jwt.createdAt,
                                    updatedAt: user.jwt.updatedAt
                                });
                            }
                        }
                        return JSON.stringify(stringifyPayload)
                    })(),
                    actionTime: new Date()
                });
                return {
                    logOut: true,
                    code: LogOutResult.SUCCESS,
                    data: null
                };
            default:
                return {
                    logOut: false,
                    code: LogOutResult.INVALID_TOKEN_PROVIDED,
                    data: verifyResult.code
                };
        }
    }

    /**
     * @description Generates a new JWT and stores it into the database.
     */
    public async updateJWT(): Promise<ITokenInterface> {
        let user: User;
        if (!this.jwt || !this.login) {
            user = await User.getByID(this.id, ['jwt', 'login','role']);
        } else {
            user = this;
        }
        let tokenResult = await PasswordManager.generateJWToken(user);
        return tokenResult;
    }

    /**
     * DATABASE RELATED METHODS
     */
    /**
     * @param databaseService Gets the user Repository
     */
    public static getRepo(): Repository < User > {
        return DatabaseService.Instance.connection.getRepository(User);
    }

    /**
     * @description Gets all users
     */
    public static async getAll(): Promise < User[] > {
        if (User.getRepo()) {
            let result = await User.getRepo().find();
            return result;
        } else {
            throw new Error('Database not initialized.');
        }
    }

    /**
     * 
     * @param userID User ID
     * @param additionalTables Additional records linked to the main user record to return
     * @description Gets a user via it's ID
     */
    public static async getByID(userID: number, additionalTables ? : string[]): Promise < User > {
        let allowedTables: any = {
            'document': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_DOCUMENT_PROP, TableAlias.User.USER_DOCUMENT_ALIAS);
            },
            'membership': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_MEMBERSHIP_PROP, TableAlias.User.USER_MEMBERSHIP_ALIAS);
            },
            'login': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_LOGIN_PROP, TableAlias.User.USER_LOGIN_ALIAS);
            },
            'jwt': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_JWT_PROP, TableAlias.User.USER_JWT_ALIAS);
            },
            'role': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_ROLE_PROP, TableAlias.User.USER_ROLE_ALIAS);
            }
        };
        let userQuery = await this.getRepo()
            .createQueryBuilder("user")
            .where("user.id = :userID", {
                userID: userID
            });
        if (additionalTables) {
            additionalTables.forEach((tableAlias) => {
                if (tableAlias in allowedTables) {
                    allowedTables[tableAlias](userQuery)
                }
            });
        }
        let user = await userQuery.getOne();
        return user;
    }

    /**
     * 
     * @param username Username for the user
     * @param additionalTables Additional records linked to the main user record to return
     * @description Gets the user record via it's username
     */
    public static async getByUsername(username: string, additionalTables ? : string[] | null): Promise < User > {
        let allowedTables: any = {
            'document': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_DOCUMENT_PROP, TableAlias.User.USER_DOCUMENT_ALIAS);
            },
            'membership': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_MEMBERSHIP_PROP, TableAlias.User.USER_MEMBERSHIP_ALIAS);
            },
            'role': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_ROLE_PROP, TableAlias.User.USER_ROLE_ALIAS);
            },
            'jwt': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_JWT_PROP, TableAlias.User.USER_JWT_ALIAS);
            }
        };
        let userQuery = await this.getRepo()
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.login", "userLogin")
            .where("userLogin.username = :username", {
                username: username
            });
        if (additionalTables) {
            additionalTables.forEach((tableAlias) => {
                if (tableAlias in allowedTables) {
                    allowedTables[tableAlias](userQuery)
                }
            });
        }
        let user = await userQuery.getOne();
        return user;
    }

    /**
     * 
     * @param baseRoleName Base role name for the user
     * @param additionalTables Additional records linked to the main user record to return
     * @description Gets user records via heir role names 
     */
    public static async getByRoleName(baseRoleName: string, additionalTables ? : string[]): Promise < User[] > {
        let allowedTables: any = {
            'document': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_DOCUMENT_PROP, TableAlias.User.USER_DOCUMENT_ALIAS);
            },
            'membership': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_MEMBERSHIP_PROP, TableAlias.User.USER_MEMBERSHIP_ALIAS);
            },
            'login': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_LOGIN_PROP, TableAlias.User.USER_LOGIN_ALIAS);
            },
            'jwt': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_JWT_PROP, TableAlias.User.USER_JWT_ALIAS);
            },
            'role': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_ROLE_PROP, TableAlias.User.USER_ROLE_ALIAS);
            }
        };
        let userQuery = await this.getRepo()
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.role", "userRole")
            .where("userRole.baseRole = :baseRoleName", {
                baseRoleName: baseRoleName
            });
        if (additionalTables) {
            additionalTables.forEach((tableAlias) => {
                if (tableAlias in allowedTables) {
                    allowedTables[tableAlias](userQuery)
                }
            });
        }
        let user = await userQuery.getMany();
        return user;
    }

    /**
     * 
     * @param prefix Document prefix
     * @param content Document value
     * @param additionalTables Additional records linked to the main user record to return
     * @description Gets a user record based on it's ID document
     */
    public static async getByDocument(prefix: string, content: string, additionalTables ? : string[] | null): Promise < User > {
        let allowedTables: any = {
            'role': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_ROLE_PROP, TableAlias.User.USER_ROLE_ALIAS);
            },
            'membership': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_MEMBERSHIP_PROP, TableAlias.User.USER_MEMBERSHIP_ALIAS);
            },
            'login': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_LOGIN_PROP, TableAlias.User.USER_LOGIN_ALIAS);
            },
            'jwt': (qb: SelectQueryBuilder < User > ) => {
                return qb.leftJoinAndSelect(TableAlias.User.USER_JWT_PROP, TableAlias.User.USER_JWT_ALIAS);
            }
        };
        
        let userQuery = await this.getRepo()
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.document", "userDocument")
            .where("userDocument.prefix = :prefix", {
                prefix: prefix
            })
            .andWhere("userDocument.content = :content", {
                content: content
                //content: (content && prefix) ? SyntaxValidationProvider.normalizeDocumentContentFunctions[prefix](content) : content
            });
        if (additionalTables) {
            additionalTables.forEach((tableAlias) => {
                if (tableAlias in allowedTables) {
                    allowedTables[tableAlias](userQuery)
                }
            });
        }
        let user = await userQuery.getOne();
        return user;
    }

    /**
     * 
     * @param additionalTables Additional records linked to the main user record to return
     * @description Gets the base super-user record.
     */
    public static async getSuperUser(additionalTables ? : string[]): Promise < User > {
        let byRoleNames = await User.getByRoleName(`${BASE_ROLE_IDS.SUPER_ADMIN}`, additionalTables);
        return byRoleNames[0];
    }

    /**
     * 
     * @param payload Super admin creation payload
     * @returns The creation result for the record
     * @description Creates a super-admin record
     */
    public static async createSuperAdmin(payload: ISuperAdminCreationPayload): Promise < ISuperAdminCreationResult > {
        try {
            let validationResult = SyntaxValidationProvider.Instance.validateSuperAdminCreationPayload(payload);

            if (validationResult.valid) {
                let existingUser: User = await User.getSuperUser() || await User.getByUsername(payload.username);
                if (existingUser) {
                    return {
                        created: false,
                        message: validationResult,
                        result: SuperAdminCreationResult.USER_ALREADY_EXISTS,
                        user: null
                    }
                };


                let superAdmin = new User();
                //User
                superAdmin.firstName = payload.firstName;
                superAdmin.surName = payload.surName;
                superAdmin.address = payload.address;
                superAdmin.phone = payload.phone;
                superAdmin.status = SuperAdminStatus.ACTIVE;
                //User
                //Rol
                let superAdminBaseRole = await BaseRole.getSuperAdminBaseRole();
                let superAdminRole = new Role();
                superAdminRole.copyBaseRole(superAdminBaseRole);
                superAdminRole.status = RoleStatus.ACTIVE;
                superAdminRole.user = superAdmin;
                //Rol
                //Document
                let superAdminDocument:Doc;
                if(payload.document !== undefined){
                    superAdminDocument = new Doc();
                    superAdminDocument.content = payload.document.content;
                    superAdminDocument.prefix = payload.document.prefix;
                    superAdminDocument.image = payload.document.image;
                    superAdminDocument.status = DocumentStatus.ACTIVE;
                    superAdminDocument.user = superAdmin;
                }
                //Document
                //Login
                let superAdminLogin = new Login();
                superAdminLogin.username = payload.username;
                superAdminLogin.setPassword(payload.password);
                superAdminLogin.status = LoginStatus.ACTIVE;
                superAdminLogin.user = superAdmin;

                //Login
                superAdminRole = await DatabaseService.Instance.connection.getRepository(Role).save(superAdminRole);
                superAdminLogin = await DatabaseService.Instance.connection.getRepository(Login).save(superAdminLogin);
                if(superAdminDocument){
                    superAdminDocument = await DatabaseService.Instance.connection.getRepository(Doc).save(superAdminDocument);
                    superAdmin.document = superAdminDocument;
                }
                superAdmin.role = superAdminRole;
                superAdmin.login = superAdminLogin;
                try {
                    superAdmin = await User.getRepo().save(superAdmin);
                } catch (e) {
                    await DatabaseService.Instance.connection.getRepository(Role).remove(superAdminRole);
                    await DatabaseService.Instance.connection.getRepository(Login).remove(superAdminLogin);
                    if(superAdminDocument){
                        await DatabaseService.Instance.connection.getRepository(Doc).remove(superAdminDocument);
                    }
                }

                //superAdmin = await User.getRepo().save(superAdmin);
                if (superAdmin.createdAt) {
                    //Log Incidence
                    await Log.logAction(null, {
                        action: LogActions.super_admin_creation,
                        newValue: ((): string => {
                            let stringifyPayload = JSON.parse(JSON.stringify(payload));
                            delete stringifyPayload.password;
                            return JSON.stringify(stringifyPayload)
                        })(),
                        actionTime: new Date()
                    });
                    return {
                        created: true,
                        message: validationResult,
                        result: SuperAdminCreationResult.SUCCESS,
                        user: superAdmin
                    }
                } else {
                    return {
                        created: false,
                        message: validationResult,
                        result: SuperAdminCreationResult.INVALID_CREATION,
                        user: superAdmin
                    }
                }
            } else {
                return {
                    created: false,
                    message: validationResult,
                    result: SuperAdminCreationResult.INVALID_DATA,
                    user: null
                }
            }
        } catch (e) {
            console.log(`
            
            Error caught:
            `,e);
            return {
                created: false,
                message: e,
                result: OperationError.INTERNAL_ERROR,
                user: null
            }
        }
    }

    /**
     * @param payload Payload for the user
     * @returns Returns the super-admin update operation result
     * @description Updates the super-admin record into the database
     */
    public static async updateSuperAdmin(payload: ISuperAdminUpdatePayload): Promise < ISuperAdminUpdateResult > {
        //0. Validamos Payload.
        let updatedPassword = false;
        try {
            let validationResult = SyntaxValidationProvider.Instance.validateSuperAdminUpdatePayload(payload);
            if (validationResult.valid) {
                //1. Obtenemos SuperAdmin.
                let updated: boolean = false;
                let superAdmin: User = await User.getSuperUser(['login']);
                if (!superAdmin) {
                    return {
                        updated: false,
                        message: validationResult,
                        result: SuperAdminUpdateResult.USER_NOT_FOUND
                    }
                }
                let oldRawValue = superAdmin.toJson();
                //2. Actualizamos.
                if (payload.firstName || payload.surName) {
                    superAdmin.firstName = payload.firstName ? payload.firstName : superAdmin.firstName;
                    superAdmin.surName = payload.surName ? payload.surName : superAdmin.surName;
                    //await User.getRepo().save(superAdmin);
                    updated = true;
                }
                superAdmin.address = payload.address ? (()=>{
                    updated = true;
                    return payload.address;
                })() : superAdmin.address;
                superAdmin.phone = payload.phone ? (()=>{
                    updated = true;
                    return payload.phone;
                })() : superAdmin.phone;

                if (payload.username || payload.password) {
                    if (payload.username) {
                        superAdmin.login.username = payload.username;
                    }
                    if (payload.password) {
                        superAdmin.login.setPassword(payload.password);
                    }
                    updatedPassword = true;
                    updated = true;
                }
                if (updated) {
                    await User.getRepo().save(superAdmin);
                    let newRawValue = superAdmin.toJson();
                    if (!updatedPassword) {
                        await Log.logAction(null, {
                            action: LogActions.super_admin_update,
                            newValue: User.calculateAuditValue(oldRawValue, newRawValue, true),
                            previousValue:User.calculateAuditValue(oldRawValue, newRawValue),
                            actionTime: new Date()
                        });
                    } else {
                        await Log.logAction(null, {
                            action: LogActions.super_admin_update,
                            newValue: User.calculateAuditValue(oldRawValue, newRawValue, true),
                            previousValue:User.calculateAuditValue(oldRawValue, newRawValue),
                            actionTime: new Date()
                        });
                        await Log.logAction(null, {
                            action: LogActions.auth_changed_password,
                            newValue: User.calculateAuditValue(oldRawValue, newRawValue, true),
                            previousValue:User.calculateAuditValue(oldRawValue, newRawValue),
                            actionTime: new Date()
                        });
                    }
                    return {
                        updated: true,
                        message: validationResult,
                        result: SuperAdminUpdateResult.SUCCESS
                    }
                } else {
                    return {
                        updated: false,
                        message: validationResult,
                        result: SuperAdminUpdateResult.INVALID_DATA
                    }
                }
            } else {
                return {
                    updated: false,
                    message: validationResult,
                    result: SuperAdminUpdateResult.INVALID_DATA
                }
            }
        } catch (e) {
            return {
                updated: false,
                message: e,
                result: OperationError.INTERNAL_ERROR
            }
        }
    }

    /**
     * 
     * @param payload Creates a new admin profile
     * @returns The admin profile creation payload
     * @description Creates a new user with admin role
     */
    public async createAdmin(payload: IAdminCreationPayload): Promise < IAdminCreationResult > {
        try {
            let validationResult = SyntaxValidationProvider.Instance.validateAdminCreationPayload(payload);
            if (validationResult.valid) {
                let existingUser: User = await User.getByUsername(payload.username);
                if (existingUser) {
                    return {
                        created: false,
                        message: validationResult,
                        result: AdminCreationResult.USER_ALREADY_EXISTS,
                        user: null
                    }
                };

                let admin = new User();
                //User
                admin.firstName = payload.firstName;
                admin.surName = payload.surName;
                admin.address = payload.address;
                admin.phone = payload.phone;
                admin.status = AdminStatus.ACTIVE;
                //User
                //Rol
                let adminBaseRole = await BaseRole.getAdminBaseRole();
                let adminRole = new Role();
                adminRole.copyBaseRole(adminBaseRole);
                adminRole.status = RoleStatus.ACTIVE;
                adminRole.user = admin;
                //Rol
                //Login
                let adminLogin = new Login();
                adminLogin.username = payload.username;
                adminLogin.setPassword(payload.password);
                adminLogin.status = LoginStatus.ACTIVE;
                adminLogin.user = admin;
                //Login
                //Document
                let adminDocument:Doc;
                if(payload.document){
                    adminDocument =  new Doc();
                    adminDocument.content = payload.document.content;
                    adminDocument.prefix = payload.document.prefix;
                    adminDocument.status = DocumentStatus.ACTIVE;
                    adminDocument.user = admin;
                }
                //Document
                adminRole = await DatabaseService.Instance.connection.getRepository(Role).save(adminRole);
                adminLogin = await DatabaseService.Instance.connection.getRepository(Login).save(adminLogin);
                if(adminDocument){
                    adminDocument = await DatabaseService.Instance.connection.getRepository(Doc).save(adminDocument);
                    admin.document = adminDocument;
                }

                admin.role = adminRole;
                admin.login = adminLogin;
                try {
                    //throw new Error('STOP!.. Hammer Time!');
                    await User.getRepo().save(admin);                    
                } catch (e) {
                    await DatabaseService.Instance.connection.getRepository(Role).remove(adminRole);
                    await DatabaseService.Instance.connection.getRepository(Login).remove(adminLogin);
                    if(adminDocument){
                        await DatabaseService.Instance.connection.getRepository(Doc).remove(adminDocument);
                    }
                }

                if (admin.createdAt) {
                    await Log.logAction(this, {
                        action: LogActions.admin_add,
                        newValue: ((): string => {
                            let newValue: string = "";
                            try {
                                newValue = JSON.stringify(admin);
                            } catch (e) {
                                //newValue = JSON.stringify(payload);
                            }
                            return newValue
                        })(),
                        actionTime: new Date()
                    });
                    return {
                        created: true,
                        message: validationResult,
                        result: AdminCreationResult.SUCCESS,
                        user: admin
                    }
                } else {
                    return {
                        created: false,
                        message: validationResult,
                        result: AdminCreationResult.INVALID_CREATION,
                        user: <any>admin.toJson()
                    }
                }
            } else {
                return {
                    created: false,
                    message: validationResult,
                    result: AdminCreationResult.INVALID_DATA,
                    user: null
                }
            }
        } catch (e) {
            console.log(`
            
            
            Error caught: `,e);
            return {
                created: false,
                message: <any>(e+""),
                result: OperationError.INTERNAL_ERROR,
                user: null
            }
        }
    }

    /**
     * 
     * @param adminID Numerical ID for the admin to update.
     * @param payload Payload for the update {IAdminUpdatePayload}.
     * @description Updates an admin's profile. If it doesn't yet have an assigned document,
     * it creates it as long as the document data is correct.
     */
    public async updateAdmin(adminID: number, payload: IAdminUpdatePayload): Promise < IAdminUpdateResult > {
        //0. Validamos Payload.
        try {

            let validationResult = SyntaxValidationProvider.Instance.validateAdminUpdatePayload(payload);
            if (validationResult.valid) {
                //1. Obtenemos al Admin por ID.
                let updated: boolean = false;
                let admin: User = await User.getByID(adminID, ['login', 'document']);
                
                if (!admin) {
                    return {
                        updated: false,
                        message: validationResult,
                        result: AdminUpdateResult.USER_NOT_FOUND
                    }
                }
                let previousRawValue = null;
                let newRawValue = null;
                previousRawValue = admin.toJson();
                
                //2. Actualizamos.
                if (payload.firstName || payload.surName) {
                    admin.firstName = payload.firstName ? payload.firstName : admin.firstName;
                    admin.surName = payload.surName ? payload.surName : admin.surName;
                    updated = true;
                }
                admin.address = payload.address ? (()=>{
                    updated = true;
                    return payload.address;
                })() : admin.address;
                admin.phone = payload.phone ? (()=>{
                    updated = true;
                    return payload.phone;
                })() : admin.phone;
                
                if (payload.username && SyntaxValidationProvider.usernameRegEx.test(payload.username)) {
                    if (payload.username) {
                        admin.login.username = payload.username;
                    }
                    updated = true;
                }

                if(payload.password && SyntaxValidationProvider.passwordRegEx.test(payload.password)){
                    if (payload.password) {
                        admin.login.setPassword(payload.password);
                    }
                    updated = true;
                }
                if (payload.document) {
                    admin.document = (admin.document) ? ((): Doc => {
                        if (payload.document.prefix) {
                            admin.document.prefix = payload.document.prefix;
                            updated = true;
                        }
                        if (payload.document.content) {
                            admin.document.content = payload.document.content;
                            updated = true;
                        }
                        return admin.document;
                    })() : ((): Doc | null => {
                        if (payload.document.prefix && payload.document.content) {
                            let doc = new Doc();
                            doc.user = admin; //Si no existe el documento, lo creamos
                            doc.status = DocumentStatus.ACTIVE;
                            doc.content = payload.document.content;
                            doc.prefix = payload.document.prefix;
                            updated = true;
                            return doc;
                        }
                        return null;
                    })();
                }
                if (updated) {
                    await User.getRepo().save(admin);
                    
                    try{
                        newRawValue = admin.toJson();
                    }catch(e){
                        console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nERROR PARSING: ",e.toString(),"\n\n\n\n\n\n\n\n")
                    }
                    
                    if (payload.password) {
                        await Log.logAction(this, {
                            action: LogActions.auth_changed_password,
                            newValue: ((): string => {
                                let newValue: string = "";
                                try {
                                    newValue = JSON.stringify(admin);
                                } catch (e) {
                                    let logContent = {
                                        user: {
                                            id: admin.id,
                                            surName: admin.surName,
                                            firstName: admin.firstName,
                                            login: {
                                                username: admin.login.username
                                            }
                                        }
                                    };
                                    newValue = JSON.stringify(logContent);
                                }
                                return newValue
                            })(),
                            actionTime: new Date()
                        });
                    }
                    await Log.logAction(this, {
                        action: LogActions.admin_update,
                        newValue: (()=>{
                            let newValueA = JSON.parse(User.calculateAuditValue(previousRawValue, newRawValue, true));
                            newValueA['affected_user_id'] = adminID;
                            return JSON.stringify(newValueA);
                        })(),
                        previousValue:(()=>{
                            let newValueA = JSON.parse(User.calculateAuditValue(previousRawValue, newRawValue));
                            return JSON.stringify(newValueA);
                        })()
                        ,actionTime: new Date()
                    });
                    return {
                        updated: true,
                        message: validationResult,
                        result: AdminUpdateResult.SUCCESS
                    }
                } else {
                    return {
                        updated: false,
                        message: validationResult,
                        result: AdminUpdateResult.INVALID_DATA
                    }
                }
            } else {
                return {
                    updated: false,
                    message: validationResult,
                    result: AdminUpdateResult.INVALID_DATA
                }
            }
        } catch (e) {
            return {
                updated: false,
                message: e,
                result: OperationError.INTERNAL_ERROR
            }
        }
    }

    /**
     * 
     * @param adminID The admin ID to remove
     * @description Removes an admin from the system. If the admin has made operations (there's a log found
     * with it's id), the admin will be deleted logically. Otherwise, it will be deleted physically.
     */
    public async removeAdmin(adminID: number): Promise<IAdminRemoveResult> {
        try{
            let admin:User = await User.getByID(adminID, ['login','document','jwt','contacts','role']);
            if(!admin){
                return {
                    removed: false,
                    result: AdminRemoveResult.USER_NOT_FOUND
                }
            }
            await admin.loadLogs({take:1});
            if(admin.logs.length<1){
                if(admin.login){            
                    const loginID = admin.login.id;
                    admin.login.user = null;
                    await DatabaseService.Instance.connection.getRepository(Login).save(admin.login);
                    admin.login = null;
                    await DatabaseService.Instance.connection.getRepository(User).save(admin);
                    let loginDoDelete = await DatabaseService.Instance.connection.getRepository(Login).find({id:loginID});
                    await DatabaseService.Instance.connection.getRepository(Login).remove(loginDoDelete);
                }
                if(admin.jwt){
                    const jwtID = admin.jwt.id;
                    admin.jwt.user = null;
                    await DatabaseService.Instance.connection.getRepository(Jwt).save(admin.jwt);
                    admin.jwt = null;
                    await DatabaseService.Instance.connection.getRepository(User).save(admin);
                    
                    let jwtToDelete = await DatabaseService.Instance.connection.getRepository(Jwt).find({id:jwtID});

                    await DatabaseService.Instance.connection.getRepository(Jwt).remove(jwtToDelete);
                }
                if(admin.document){
                    const documentID = admin.document.id;
                    admin.document.user = null;
                    await DatabaseService.Instance.connection.getRepository(Doc).save(admin.document);
                    admin.document = null;
                    await DatabaseService.Instance.connection.getRepository(User).save(admin);
                    
                    let documentToDelete = await DatabaseService.Instance.connection.getRepository(Doc).find({id:documentID});

                    await DatabaseService.Instance.connection.getRepository(Doc).remove(documentToDelete);
                }
                if(admin.role){
                    const roleID = admin.role.id;
                    admin.role.user = null;
                    await DatabaseService.Instance.connection.getRepository(Role).save(admin.role);
                    admin.role = null;
                    await DatabaseService.Instance.connection.getRepository(User).save(admin);
                    
                    let roleToDelete = await DatabaseService.Instance.connection.getRepository(Role).find({id:<any>roleID});

                    await DatabaseService.Instance.connection.getRepository(Role).remove(roleToDelete);
                }
                if(admin.contacts){
                    await DatabaseService.Instance.connection.getRepository(UserContact).remove(admin.contacts);
                }
                admin = await User.getByID(adminID, ['login','document','jwt','contacts']);
                await DatabaseService.Instance.connection.getRepository(User).remove(admin); 
                return {
                    removed:true
                    ,message: admin
                    ,result: AdminRemoveResult.SUCCESS_PHYSICAL
                };
            }else{
                if(admin.jwt && admin.jwt.token){
                    try{
                        await User.logOut(admin.jwt.token);
                    }catch(e){

                    }                    
                }
                admin.status = AdminStatus.DELETED;
                admin = await DatabaseService.Instance.connection.getRepository(User).save(admin);
                return {
                    removed:true
                    ,message: admin
                    ,result: AdminRemoveResult.SUCCESS_LOGICAL
                };
            }
        }catch(e){
            return {
                removed: false,
                message: e,
                result: OperationError.INTERNAL_ERROR
            }
        }
    }

    /**
     * 
     * @param adminID The client ID to delete.
     * @default Removes a client from the databas.e If the client has operations made to it's
     * name (logs), or possess payments done, there will be done a logical removal. Otherwise, it will
     * be physically removed.
     */
    public async removeClient(clientID: number): Promise<IClientRemoveResult> {
        try{
            let client:User = await User.getByID(clientID, ['login','document','membership','jwt','role']);
            if(!client){
                return {
                    removed: false,
                    result: ClientRemoveResult.USER_NOT_FOUND
                }
            }
            await client.loadLogs({take:1});
            if(client.membership){
                await client.membership.loadPayments({take:1});
            }

            let hasLogs = (client.logs && client.logs.length>0);
            let hasPayments = (client.membership && client.membership.payments && client.membership.payments.length>0);
            
            if(!hasLogs && !hasPayments){   //Remoción física
                if(client.membership){
                    const membershipID = client.membership.id;
                    client.membership.user = null;
                    await DatabaseService.Instance.connection.getRepository(Membership).save(client.membership);
                    client.membership = null;
                    await DatabaseService.Instance.connection.getRepository(User).save(client);

                    let membershipToDelete = await DatabaseService.Instance.connection.getRepository(Membership).find({id:<any>membershipID});
                    await DatabaseService.Instance.connection.getRepository(Membership).remove(membershipToDelete);
                }
                if(client.document){
                    const documentID = client.document.id;
                    client.document.user = null;
                    await DatabaseService.Instance.connection.getRepository(Doc).save(client.document);
                    client.document = null;
                    await DatabaseService.Instance.connection.getRepository(User).save(client);

                    let documentToDelete = await DatabaseService.Instance.connection.getRepository(Doc).find({id:<any>documentID});
                    await DatabaseService.Instance.connection.getRepository(Doc).remove(documentToDelete);
                }
                if(client.document){
                    const documentID = client.document.id;
                    client.document.user = null;
                    await DatabaseService.Instance.connection.getRepository(Doc).save(client.document);
                    client.document = null;
                    await DatabaseService.Instance.connection.getRepository(User).save(client);

                    let documentToDelete = await DatabaseService.Instance.connection.getRepository(Doc).find({id:<any>documentID});
                    await DatabaseService.Instance.connection.getRepository(Doc).remove(documentToDelete);
                }
                if(client.role){
                    const roleID = client.role.id;
                    client.role.user = null;
                    await DatabaseService.Instance.connection.getRepository(Role).save(client.role);
                    client.role = null;
                    await DatabaseService.Instance.connection.getRepository(User).save(client);

                    let roleToDelete = await DatabaseService.Instance.connection.getRepository(Role).find({id:<any>roleID});
                    await DatabaseService.Instance.connection.getRepository(Role).remove(roleToDelete);
                }
                if(client.login){
                    const loginID = client.login.id;
                    client.login.user = null;
                    await DatabaseService.Instance.connection.getRepository(Login).save(client.login);
                    client.login = null;
                    await DatabaseService.Instance.connection.getRepository(User).save(client);

                    let loginToDelete = await DatabaseService.Instance.connection.getRepository(Login).find({id:<any>loginID});
                    await DatabaseService.Instance.connection.getRepository(Login).remove(loginToDelete);
                    
                    if(client.jwt){
                        const jwtID = client.jwt.id;
                        client.jwt.user = null;
                        await DatabaseService.Instance.connection.getRepository(Jwt).save(client.jwt);
                        client.jwt = null;
                        await DatabaseService.Instance.connection.getRepository(User).save(client);

                        let jwtToDelete = await DatabaseService.Instance.connection.getRepository(Jwt).find({id:<any>jwtID});
                        await DatabaseService.Instance.connection.getRepository(Jwt).remove(jwtToDelete);
                    }
                }

                client = await User.getByID(clientID, ['login','document','membership','jwt','role']);
                await DatabaseService.Instance.connection.getRepository(User).remove(client); 
                return {
                    removed:true
                    ,message: client
                    ,result: ClientRemoveResult.SUCCESS_PHYSICAL
                };
            }else{  //Remoción Lógica
                client.status = ClientStatus.DELETED;
                client = await DatabaseService.Instance.connection.getRepository(User).save(client);
                return {
                    removed:true
                    ,message: client
                    ,result: ClientRemoveResult.SUCCESS_LOGICAL
                };
            }
        }catch(e){
            return {
                removed: false,
                message: e,
                result: OperationError.INTERNAL_ERROR
            }
        }
    }

    /**
     * 
     * @param adminID The ID for the client to restore
     * @description Logically restores a client.
     */
    public async restoreClient(clientID: number): Promise<IClientRestoreResult> {
        try{
            let client:User = await User.getByID(clientID);
            if(!client){
                return {
                    restored: false,
                    result: ClientRestoreResult.USER_NOT_FOUND
                }
            }
            client.status = ClientStatus.ACTIVE;
            client = await DatabaseService.Instance.connection.getRepository(User).save(client);
            return {
                restored: true,
                message: client,
                result: ClientRestoreResult.SUCCESS_LOGICAL
            }
        }catch(e){
            return {
                restored: false,
                message: e,
                result: OperationError.INTERNAL_ERROR
            }
        }
    }

    /**
     * 
     * @param adminID The admin ID to restore
     * @description Logically restores an admin if this has been logically removed.
     */
    public async restoreAdmin(clientID: number): Promise<IAdminRestoreResult> {
        try{
            let client:User = await User.getByID(clientID);
            if(!client){
                return {
                    restored: false,
                    result: AdminRestoreResult.USER_NOT_FOUND
                }
            }
            client.status = ClientStatus.ACTIVE;
            client = await DatabaseService.Instance.connection.getRepository(User).save(client);
            return {
                restored: true,
                message: client,
                result: AdminRestoreResult.SUCCESS_LOGICAL
            }
        }catch(e){
            return {
                restored: false,
                message: e,
                result: OperationError.INTERNAL_ERROR
            }
        }
    }


    /**
     * @param payload Creation payload data
     * @description Creates a new client onto the database.
     */
    public async createClient(payload: IClientCreationPayload): Promise < IClientCreationResult > {
        try {
            let validationResult = SyntaxValidationProvider.Instance.validateClientCreationPayload(payload);

            if (validationResult.valid) {
                let existingClient = await User.getByDocument(payload.document.prefix, payload.document.content, null);
                if (existingClient) {
                    return {
                        created: false,
                        message: validationResult,
                        result: ClientCreationResult.USER_ALREADY_EXISTS,
                        user: null
                    }
                };


                let client = new User();
                //User
                client.firstName = payload.firstName;
                client.surName = payload.surName;
                client.address = payload.address;
                client.phone = payload.phone;
                client.status = ClientStatus.ACTIVE;
                //User
                //Rol
                let clientRole = new Role();
                let clientRoleBase = await BaseRole.getClientBaseRole();
                clientRole.copyBaseRole(clientRoleBase);
                clientRole.status = RoleStatus.ACTIVE;
                clientRole.user = client;
                //Rol
                //Membership
                let clientMembership = new Membership();
                clientMembership.company = await Company.getBaseCompany();
                clientMembership.status = MembershipStatus.ACTIVE;
                clientMembership.monthAmmount = payload.membership.monthAmmount;

                if (payload.membership && payload.membership.inscriptionDate && !isNaN(payload.membership.inscriptionDate)) {
                    try {
                        clientMembership.inscriptionDate = new Date(payload.membership.inscriptionDate);
                    } catch (e) {
                        clientMembership.inscriptionDate = new Date();
                    }
                } else {
                    clientMembership.inscriptionDate = new Date();
                }
                if (payload.membership && payload.membership.cutDate && !isNaN(payload.membership.cutDate)) {
                    try {
                        clientMembership.cutDate = new Date(payload.membership.cutDate);
                    } catch (e) {
                        clientMembership.cutDate = new Date();
                    }
                } else {
                    clientMembership.inscriptionDate = new Date();
                }
                clientMembership.user = client;
                //Membership
                //Document
                let clientDocument = new Doc();
                clientDocument.prefix = payload.document.prefix;
                clientDocument.content = payload.document.content;
                clientDocument.image = (payload.document.image) ? payload.document.image : null;
                clientDocument.status = DocumentStatus.ACTIVE;
                clientDocument.user = client;
                //Document
                clientRole = await DatabaseService.Instance.connection.getRepository(Role).save(clientRole);
                clientMembership = await DatabaseService.Instance.connection.getRepository(Membership).save(clientMembership);
                clientDocument = await DatabaseService.Instance.connection.getRepository(Doc).save(clientDocument);
                //clientLogin         = await DatabaseService.Instance.connection.getRepository(Login).save(clientLogin);


                client.role = clientRole;
                client.membership = clientMembership;
                client.document = clientDocument;
                //client.login        = clientLogin;

                try {
                    client = await User.getRepo().save(client);
                } catch (e) {
                    await DatabaseService.Instance.connection.getRepository(Doc).remove(clientDocument);
                    await DatabaseService.Instance.connection.getRepository(Role).remove(clientRole);
                    await DatabaseService.Instance.connection.getRepository(Membership).remove(clientMembership);
                }

                //admin = await User.getRepo().save(admin);
                if (client.createdAt) {
                    await Log.logAction(this, {
                        action: LogActions.client_incorporate,
                        newValue: ((): string => {
                            let newValue: string = "";
                            newValue = JSON.stringify(payload);
                            return newValue
                        })(),
                        actionTime: new Date()
                    });
                    return {
                        created: true,
                        message: validationResult,
                        result: ClientCreationResult.SUCCESS,
                        user: client
                    }
                } else {
                    return {
                        created: false,
                        message: validationResult,
                        result: ClientCreationResult.INVALID_CREATION,
                        user: client
                    }
                }
            } else {
                return {
                    created: false,
                    message: validationResult,
                    result: ClientCreationResult.INVALID_DATA,
                    user: null
                }
            }
        } catch (e) {
            return {
                created: false,
                message: e,
                result: OperationError.INTERNAL_ERROR,
                user: null
            }
        }
    }

    /**
     * @param clientID ID for the client to update; numerical.
     * @param payload Update pauload {ICLientUpdatePayload}.
     * @description Updates a client profile.
     */
    public async updateClient(clientID: number, payload: IClientUpdatePayload): Promise < IClientUpdateResult > {
        //0. Validamos Payload.
        try {

            let validationResult = SyntaxValidationProvider.Instance.validateClientUpdatePayload(payload);
            if (validationResult.valid) {
                //1. Obtenemos cliente.
                let updated: boolean = false;
                let client: User = await User.getByID(clientID, ['login', 'document', 'membership']);
                let previousRawValue = client.toJson();
                let newRawValue:any = null;
                
                if (!client) {
                    return {
                        updated: false,
                        message: validationResult,
                        result: ClientUpdateResult.USER_NOT_FOUND
                    }
                }

                //2. Actualizamos.
                if (payload.firstName || payload.surName) {
                    client.firstName = payload.firstName ? payload.firstName : client.firstName;
                    client.surName = payload.surName ? payload.surName : client.surName;
                    updated = true;
                }
                client.address = payload.address ? (()=>{
                    updated = true;
                    return payload.address;
                })() : client.address;
                client.phone = payload.phone ? (()=>{
                    updated = true;
                    return payload.phone;
                })() : client.phone;

                if (payload.document) {

                    //Checkeamos que el documento no exista
                    let newPrefix = (payload.document.prefix) ? payload.document.prefix : client.document.prefix;
                    let newContent = (payload.document.content) ? payload.document.content : client.document.content;
                    let existingUser: User = await User.getByDocument(newPrefix, newContent);
                    if (existingUser && (existingUser.id != clientID)) {
                        return {
                            updated: false,
                            message: validationResult,
                            result: ClientUpdateResult.SAME_DOCUMENT_ALREADY_EXISTS
                        }
                    }


                    client.document = (client.document) ? ((): Doc => {
                        //Actualizamos el documento existente
                        if (payload.document.prefix) {
                            client.document.prefix = payload.document.prefix;
                            updated = true;
                        }
                        if (payload.document.content) {
                            client.document.content = payload.document.content;
                            updated = true;
                        }
                        if (payload.document.image) {
                            client.document.image = payload.document.image;
                            updated = true;
                        }
                        return client.document;
                    })() : ((): Doc | null => {
                        //Creamos un nuevo documento
                        if (payload.document.prefix && payload.document.content) {
                            let doc = new Doc();
                            doc.user = client; //Si no existe el documento, lo creamos
                            doc.status = DocumentStatus.ACTIVE;
                            doc.content = payload.document.content;
                            doc.prefix = payload.document.prefix;
                            doc.image = payload.document.image ? payload.document.image : null;
                            updated = true;
                            return doc;
                        }
                        return null;
                    })();
                }
                if (payload.membership) {
                    client.membership = (client.membership) ? ((): Membership => {  //Si tiene una membresía
                        if (payload.membership.cutDate) {
                            client.membership.cutDate = new Date(payload.membership.cutDate);
                            updated = true;
                        }
                        if (payload.membership.inscriptionDate) {
                            client.membership.inscriptionDate = new Date(payload.membership.inscriptionDate);
                            updated = true;
                        }
                        if(payload.membership.monthAmmount){
                            client.membership.monthAmmount = payload.membership.monthAmmount;
                            updated = true;
                        }
                        return client.membership;
                    })() : await (async (): Promise < Membership | null > => {          //Si no tiene una membresía
                        if (payload.membership.inscriptionDate || payload.membership.cutDate) {
                            client.membership = new Membership();
                            client.membership.company = await Company.getBaseCompany();
                            client.membership.status = MembershipStatus.ACTIVE;
                            client.membership.user = client;
                            client.membership.cutDate = (payload.membership.cutDate) ?
                                new Date(payload.membership.cutDate) : client.membership.cutDate;
                            client.membership.inscriptionDate = (payload.membership.inscriptionDate) ?
                                new Date(payload.membership.inscriptionDate) : client.membership.inscriptionDate;
                            updated = true;
                            return client.membership;
                        }
                        return null;
                    })();
                }
                if (updated) {
                    client = await User.getRepo().save(client);
                    newRawValue = client.toJson();

                    await Log.logAction(this, {
                        action: LogActions.client_update,
                        previousValue:(()=>{
                            let previousValueA = User.calculateAuditValue(previousRawValue, newRawValue);
                            return previousValueA;
                        })(),
                        newValue: (()=>{
                            let newValueA = JSON.parse(User.calculateAuditValue(previousRawValue, newRawValue, true));
                            newValueA['affected_user_id'] = client.id;
                            newValueA = JSON.stringify(newValueA);
                            return newValueA;
                        })(),
                        actionTime: new Date()
                    });
                    return {
                        updated: true,
                        message: validationResult,
                        result: ClientUpdateResult.SUCCESS
                    }
                } else {
                    return {
                        updated: false,
                        message: validationResult,
                        result: ClientUpdateResult.INVALID_DATA
                    }
                }
            } else {
                console.log(`
                
                *****************************
                INVALID CLIENT DATA. validationResult: `,validationResult,`
                *****************************
                
                `);
                return {
                    updated: false,
                    message: validationResult,
                    result: ClientUpdateResult.INVALID_DATA
                }
            }
        } catch (e) {
            console.log(`
            
            
            ERROR: `,e);
            return {
                updated: false,
                message: e,
                result: OperationError.INTERNAL_ERROR
            }
        }
    }

    /**
     * 
     * @param clientID ID of the client to add the payment to
     * @param payload Payload for the information of the client
     * @description Adds a client payment to the database, and updates it's cut date if it has been provided.
     */
    public async addPayment(clientID: number, payload: IPaymentAddPayload): Promise < IPaymentAddResult > {
        try {
            let validationResult = SyntaxValidationProvider.Instance.validatePaymentAddPayload(payload);
            if (validationResult.valid) {
                const client: User = await User.getByID(clientID, ['membership']);

                if(client){
                    let payment = new Payment();
                    payment.ammount = payload.payment.ammount;
                    payment.currency = await DatabaseService.Instance.connection.getRepository(Currency)
                    .findOne(payload.payment.currency);
                    if (!payment.currency) {
                        return {
                            created: false,
                            message: validationResult,
                            result: PaymentAddResult.CURRENCY_DOES_NOT_EXIST,
                            payment: null
                        }
                    }
                    payment.paymentMethod = payload.payment.method;
                    payment.notes = payload.payment.notes;
                    payment.status = PaymentStatus.ACTIVE;
                    //client.membership.user = client;
    
                    await Membership.addPayment(payment, client.membership);
    
                    if (payload.membership) {
                        client.membership.cutDate = (payload.membership.cutDate) ? new Date(payload.membership.cutDate) : client.membership.cutDate;
                        client.membership.monthAmmount = (payload.membership.monthAmmount) ? payload.membership.monthAmmount : client.membership.monthAmmount;
                    }
                    await DatabaseService.Instance.connection.getRepository(Membership).save(client.membership);
                    await User.getRepo().save(client);
                    await Log.logAction(this, {
                        action: LogActions.payment_add,
                        newValue: ((): string => {
                            let newValueA = JSON.parse(JSON.stringify(payload));
                            newValueA['affected_user_id'] = clientID;
                            return JSON.stringify(newValueA);
                        })(),
                        actionTime: new Date()
                    });
                    return {
                        created: true,
                        message: validationResult,
                        result: PaymentAddResult.SUCCESS,
                        payment: payment
                    }
                }else{
                    return {
                        created: false,
                        message: validationResult,
                        result: PaymentAddResult.USER_NOT_FOUND,
                        payment: null
                    }
                }
            } else {
                return {
                    created: false,
                    message: validationResult,
                    result: PaymentAddResult.INVALID_DATA,
                    payment: null
                }
            }
        } catch (e) {
            return {
                created: false,
                message: e,
                result: OperationError.INTERNAL_ERROR,
                payment: null
            }
        }
    }


    /**
     * @param previousRawValue Previous value, JSON format
     * @param newRawValue New value, JSON format
     * @param calculateNew If it's specified, will calculate the new value to return
     * @description Return the new changes and differences from one field to the other
     * 
     */
    public static calculateAuditValue(previousRawValue:any, newRawValue:any, calculateNew?:boolean){
        let newRawValueString = null;
        if(newRawValue && previousRawValue){
            try{
                let compareBaseObject:any;
                let toCompareBaseObject:any;
                if(!calculateNew){
                    compareBaseObject = previousRawValue;
                    toCompareBaseObject = newRawValue;
                }else{
                    compareBaseObject = newRawValue;
                    toCompareBaseObject = previousRawValue;
                }
                let returnRawValueObject:{
                    [index:string]:any
                } = {};
                Object.keys(compareBaseObject).forEach((key)=>{
                    if(compareBaseObject[key]!=toCompareBaseObject[key]){
                        if(typeof(compareBaseObject[key]) !== "object"){
                            if(JSON.stringify(compareBaseObject[key])!=JSON.stringify(toCompareBaseObject[key])){
                                returnRawValueObject[key] = compareBaseObject[key];
                            }
                        }else {
                            if(compareBaseObject[key] != null
                                && typeof(compareBaseObject[key]) !== "undefined"){
                                Object.keys(compareBaseObject[key]).forEach((subElementA)=>{
                                    if(!toCompareBaseObject[key]
                                    || JSON.stringify(compareBaseObject[key][subElementA]) != JSON.stringify(toCompareBaseObject[key][subElementA])){
                                        returnRawValueObject[key] = {};
                                        returnRawValueObject[key][subElementA] = compareBaseObject[key][subElementA];
                                    }
                                });
                            }else{
                                returnRawValueObject[key] = compareBaseObject[key];
                            }
                        }
                    }
                });
                newRawValueString = JSON.stringify(returnRawValueObject);
            }catch(e){
                console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nvvERROR COMPARYING OBJECT: \n",e,"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
            } 
        }
        return newRawValueString;
    }

    /**
     * 
     * @param adminID ID for the account (User) to update.
     * @param payload Date from the role to update.
     * @description Updates the rol for an admin.
     */
    public async updateAdminRole(adminID: number, payload: IRoleUpdatePayload): Promise < IRoleUpdateResult > {
        try {
            let validationResult = SyntaxValidationProvider.Instance.validateRoleUpdatePayload(payload);
            if (validationResult.valid) {
                //Get user role.
                //Update.
                //Save.
                //Return new role.
                const admin = await User.getByID(adminID, ['role']);
                let previousRawValue = admin.role.toJson();

                admin.role.canAddAdmin = (typeof payload.role.canAddAdmin === "boolean") ? payload.role.canAddAdmin : admin.role.canAddAdmin;
                admin.role.canAddPayment = (typeof payload.role.canAddPayment === "boolean") ? payload.role.canAddPayment : admin.role.canAddPayment;
                admin.role.canChangePassword = (typeof payload.role.canChangePassword === "boolean") ? payload.role.canChangePassword : admin.role.canChangePassword;
                admin.role.canDesincorporateClient = (typeof payload.role.canDesincorporateClient === "boolean") ? payload.role.canDesincorporateClient : admin.role.canDesincorporateClient;
                admin.role.canExportData = (typeof payload.role.canExportData === "boolean") ? payload.role.canExportData : admin.role.canExportData;
                admin.role.canImportData = (typeof payload.role.canImportData === "boolean") ? payload.role.canImportData : admin.role.canImportData;
                admin.role.canIncorporateClient = (typeof payload.role.canIncorporateClient === "boolean") ? payload.role.canIncorporateClient : admin.role.canIncorporateClient;
                admin.role.canLogin = (typeof payload.role.canLogin === "boolean") ? payload.role.canLogin : admin.role.canLogin;
                admin.role.canRemoveAdmin = (typeof payload.role.canRemoveAdmin === "boolean") ? payload.role.canRemoveAdmin : admin.role.canRemoveAdmin;
                admin.role.canRemovePayment = (typeof payload.role.canRemovePayment === "boolean") ? payload.role.canRemovePayment : admin.role.canRemovePayment;
                admin.role.canSearchAdmin = (typeof payload.role.canSearchAdmin === "boolean") ? payload.role.canSearchAdmin : admin.role.canSearchAdmin;
                admin.role.canSearchClient = (typeof payload.role.canSearchClient === "boolean") ? payload.role.canSearchClient : admin.role.canSearchClient;
                admin.role.canSearchPayment = (typeof payload.role.canSearchPayment === "boolean") ? payload.role.canSearchPayment : admin.role.canSearchPayment;
                admin.role.canUpdateAdmin = (typeof payload.role.canUpdateAdmin === "boolean") ? payload.role.canUpdateAdmin : admin.role.canUpdateAdmin;
                admin.role.canUpdateClient = (typeof payload.role.canUpdateClient === "boolean") ? payload.role.canUpdateClient : admin.role.canUpdateClient;
                admin.role.canUpdatePayment = (typeof payload.role.canUpdatePayment === "boolean") ? payload.role.canUpdatePayment : admin.role.canUpdatePayment;
                admin.role.canUpdateUserRoles = (typeof payload.role.canUpdateUserRoles === "boolean") ? payload.role.canUpdateUserRoles : admin.role.canUpdateUserRoles;

                await DatabaseService.Instance.connection.getRepository(Role).save(admin.role)
                let newRawValue = admin.role.toJson();
                await Log.logAction(this, {
                    action: LogActions.role_update,
                    newValue:User.calculateAuditValue(previousRawValue, newRawValue, true),
                    previousValue: User.calculateAuditValue(previousRawValue, newRawValue),
                    actionTime: new Date()
                });
                return {
                    updated: true,
                    message: validationResult,
                    result: RoleUpdateResult.SUCCESS
                };
            } else {
                return {
                    updated: false,
                    message: validationResult,
                    result: RoleUpdateResult.INVALID_DATA
                }
            }
        } catch (e) {
            return {
                updated: false,
                message: e,
                result: OperationError.INTERNAL_ERROR
            }
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    /**
    @description Normalizes the data before inserting it
     */
    normalize(){
        this.firstName = (this.firstName) ? this.firstName.trim() : this.firstName;
        this.surName = (this.surName) ? this.surName.trim() : this.surName;
        this.phone = (this.phone) ? this.phone.trim() : this.phone;
    }

    /**
     * 
     * @param searchOptions Search options for the user
     * @param resultMode Result mode to return to
     * @description Extension for the SearchProvider .searchUser function.
     */
    public static async searchUser(searchOptions:IUserSearchOptions, resultMode?:UserSearchResultMode){
        let result = await SearchProvider.Instance.searchUser(searchOptions, resultMode);
        return result;
    }
}