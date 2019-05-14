import {DatabaseService} from './databaseAdmin';
import {BaseRole} from '../models/BaseRole';
import {Currency} from '../models/Currency';
import {Company} from '../models/Company';
import {BaseRoles} from '../base/RoleBase';
import {BaseCurrency} from '../base/BaseCurrency'
import {TableMapping, TableNames} from '../enums/Database';
import {BaseCompany} from '../base/Company';
import { User } from '../models/User';
import { LogActions } from '../models/LogActions';

//Singleton class in charge of provide the base tables.
//Tablas base:
//1. rol_base.
//2. moneda.
//3. Company (se puede modificar luego)
//Genera / Carga los usuarios por defecto en caso de no encontrarlos en la base de datos:
//1. Si no encuentra un SuperAdmin, lo agrega.
export class BaseTableProvider {
    private static _instance: BaseTableProvider;
    public baseRoles: BaseRole[] = [];
    public baseCurrency:Currency[] = [];
    public baseCompany: Company;
    public logPreferences: LogActions;

    constructor(){

    }

    public static get Instance (){
        BaseTableProvider._instance = (BaseTableProvider._instance) ? BaseTableProvider._instance : new BaseTableProvider();
        return BaseTableProvider._instance;
    }

    /**
     * @description Initializes the base tables check-in and creation.
     */
    public async initialize(){
        if(!DatabaseService.Instance.connection 
        ||
        !DatabaseService.Instance.connection.isConnected){
            return;
        }
        try{
            this.baseRoles = await BaseTableProvider.Instance.loadBaseRoles();
            this.baseCurrency = await BaseTableProvider.Instance.loadBaseCurrency();
            this.baseCompany = await BaseTableProvider.Instance.loadCompany();
            this.logPreferences = await BaseTableProvider.Instance.loadLogPreferences();
        }catch(e){
            console.log("Error loading Base Roles...");
            console.log(e);
        }
    }

    /**
     * @description Async function that checks the base roles on the repository.
     * In case none is found, it will generate and store new base roles into the database.
     */
    public async loadBaseRoles(): Promise<BaseRole[]> {
        let roles:BaseRole[] = [];
        roles = await DatabaseService.Instance.connection.getRepository(BaseRole).find();        
        if(roles.length<1){
            BaseRoles.forEach((jsonRole:any) => {
                let assembledRole = BaseTableProvider.assembleBaseRolePayload(jsonRole);
                roles.push(assembledRole);
            });
            try{
                let newRoles = await DatabaseService.Instance.connection.getRepository(BaseRole).save(roles);
                roles = newRoles;
            }catch(e){
                console.log(`EXCEPTION HANDLING BASE ROLES GENERATION`);
                console.log(e);
            }
        }
        return roles;
    }

    /**
     * @description Async function that checks the base currency on the repository.
     * In case none is found, it will generate and store new base currency records into the database.
     */
    public async loadBaseCurrency(): Promise<Currency[]> {
        let currencies:Currency[] = [];
        currencies = await DatabaseService.Instance.connection.getRepository(Currency).find();
        if(currencies.length < BaseCurrency.length) {
            BaseCurrency.forEach((jsonCurrency:any) => {
                let currency = BaseTableProvider.assembleCurrencyPayload(jsonCurrency);
                currencies.push(currency);
            });
            try{
                let newCurrency = await DatabaseService.Instance.connection.getRepository(Currency).save(currencies);
                currencies = newCurrency;
            }catch(e){
                console.log(e);
            }
        }
        return currencies;
    }

    /**
     * @description Loads the base company. In case none is found, generates the base
     * company record and stores it.
     */
    public async loadCompany(): Promise<Company>{
        let company: Company;
        company = await DatabaseService.Instance.connection.getRepository(Company).findOne();
        if(!company){
            company = BaseTableProvider.assembleCompanyPayload(BaseCompany);
            try{
                company = await DatabaseService.Instance.connection.getRepository(Company).save(company);
            }catch(e){
                console.log("Error loading company...");
                console.log(e);
            }
        }
        return company;
    }
    
    /*
    public async loadDefaultUsers(): Promise<User[]>{
        const superAdmin = await DatabaseService.Instance.connection.createQueryBuilder()
        .select(TableNames.User.table_name)
        .from(User, TableNames.User.table_name)
        .leftJoinAndSelect('usuario.role',`role`)
        .where(`role.${TableNames.Role.canLogin} = :auth_login`, {auth_login:true})
        .andWhere(`role.${TableNames.Role.canAddAdmin} = :admin_add`, {admin_add:true})
        .andWhere(`role.${TableNames.Role.canUpdateAdmin} = :admin_update`, {admin_update:true})
        .andWhere(`role.${TableNames.Role.canRemoveAdmin} = :admin_remove`, {admin_remove:true})
        .andWhere(`role.${TableNames.Role.canSearchAdmin} = :admin_search`, {admin_search:true})
        .andWhere(`role.${TableNames.Role.canExportData} = :data_export`, {data_export:true})
        .andWhere(`role.${TableNames.Role.canExportData} = :data_import`, {data_import:true})
        .getRawOne();
        return null;
    }
    */

    /**
     * @description Loads the log settings preferences.
     */
    public async loadLogPreferences(): Promise <LogActions>{
        await LogActions.load();
        return LogActions.Instance;
    }

    /**
     * @param jsonRole The base role as a JSON object.
     * @returns The base role record.
     * @description Assembles a base role payload and returns it.
     */
    public static assembleBaseRolePayload(jsonRole: any): BaseRole {
        let roleBase = new BaseRole();
        
        roleBase.id = jsonRole[TableMapping.Role_base.id];
        roleBase.name = jsonRole[TableMapping.Role_base.name];
        roleBase.version = jsonRole[TableMapping.Role_base.version];
        roleBase.status = jsonRole[TableMapping.Role_base.status];
        if(jsonRole[TableMapping.Role_base.createdAt]){
            roleBase.createdAt = jsonRole[TableMapping.Role_base.createdAt];
        }
        if(jsonRole[TableMapping.Role_base.updatedAt]){
            roleBase.updatedAt = jsonRole[TableMapping.Role_base.updatedAt];
        }

        roleBase.canLogin = jsonRole[TableMapping.Role_base.canLogin];
        roleBase.canChangePassword = jsonRole[TableMapping.Role_base.canChangePassword];
        roleBase.canAddAdmin = jsonRole[TableMapping.Role_base.canAddAdmin];
        roleBase.canUpdateAdmin = jsonRole[TableMapping.Role_base.canUpdateAdmin];
        roleBase.canRemoveAdmin = jsonRole[TableMapping.Role_base.canRemoveAdmin];
        roleBase.canSearchAdmin = jsonRole[TableMapping.Role_base.canSearchAdmin];
        roleBase.canExportData = jsonRole[TableMapping.Role_base.canExportData];
        roleBase.canImportData = jsonRole[TableMapping.Role_base.canImportData];
        roleBase.canIncorporateClient = jsonRole[TableMapping.Role_base.canIncorporateClient];
        roleBase.canUpdateClient = jsonRole[TableMapping.Role_base.canUpdateClient];
        roleBase.canDesincorporateClient = jsonRole[TableMapping.Role_base.canDesincorporateClient];
        roleBase.canSearchClient = jsonRole[TableMapping.Role_base.canSearchClient];
        roleBase.canAddPayment = jsonRole[TableMapping.Role_base.canAddPayment];
        roleBase.canUpdatePayment = jsonRole[TableMapping.Role_base.canUpdatePayment];
        roleBase.canRemovePayment = jsonRole[TableMapping.Role_base.canRemovePayment];
        roleBase.canSearchPayment = jsonRole[TableMapping.Role_base.canSearchPayment];
        roleBase.canUpdateUserRoles = jsonRole[TableMapping.Role_base.canUpdateUserRoles];
        
        return roleBase;
    }

    /**
     * @description Assembles a Currency object from a JSON object and returns it.
     * @param jsonCurrency The JSON type currency.
     * @returns The Currency object record.
     */
    public static assembleCurrencyPayload(jsonCurrency: any): Currency {
        let currency            = new Currency();
        currency.id             = jsonCurrency[TableMapping.Currency.id];

        if(jsonCurrency[TableMapping.Currency.createdAt]){
            currency.createdAt  = jsonCurrency[TableMapping.Currency.createdAt];
        }
        if(jsonCurrency[TableMapping.Currency.updatedAt]){
            currency.updatedAt  = jsonCurrency[TableMapping.Currency.updatedAt];
        }
        currency.status         = jsonCurrency[TableMapping.Currency.status];
        currency.isoCode        = jsonCurrency[TableMapping.Currency.isoCode];
        currency.decimals       = jsonCurrency[TableMapping.Currency.decimals];
        currency.displayName    = jsonCurrency[TableMapping.Currency.displayName];
        return currency;
    }

    /**
     * @description Assembles a company object and returns it.
     * @param jsonCompany The JSON object for the company
     * @returns A Company object
     */
    public static assembleCompanyPayload(jsonCompany: any): Company {
        let company             = new Company();
        company.id              = jsonCompany[TableMapping.Company.id];
        if(jsonCompany[TableMapping.Company.createdAt]){
            company.createdAt   = jsonCompany[TableMapping.Company.createdAt];
        }
        if(jsonCompany[TableMapping.Company.updatedAt]){
            company.updatedAt   = jsonCompany[TableMapping.Company.updatedAt];
        }
        company.status          = jsonCompany[TableMapping.Company.status];
        company.name            = jsonCompany[TableMapping.Company.name];
        company.description     = jsonCompany[TableMapping.Company.description];

        return company;
    }

}