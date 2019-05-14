import {ISuperAdminCreationPayload, IClientCreationPayload, ISuperAdminUpdatePayload, IAdminCreationPayload, IAdminUpdatePayload, IClientUpdatePayload, IPaymentAddPayload, IRoleUpdatePayload, IUserSearchValidator} from '../interfaces/User';
import {IValidateSuperAdminPayloadResult, IValidateAdminPayloadResult, IValidateClientCreationPayloadResult, IValidatePaymentAddPayloadResult, IValidateRoleUpdatePayloadResult, IValidateCompanyPayloadResult} from '../interfaces/SyntaxValidationProvider';
import {ValidPayloadCodes} from '../enums/User';
import {SyntaxErrorCodes} from '../enums/SyntaxValidationProvider';
import { DOCUMENT_PREFIXES } from '../base/DocumentPrefixes';
import { PAYMENT_METHODS } from '../enums/PaymentMethods';
import { TableNames } from '../enums/Database';
import { ICompanyUpdatePayload } from '../interfaces/Company';
import * as numeral from 'numeral';



export interface IValidatePrefixFunction {
    (value:string) : boolean;
}

/**
 * @description Validates the syntax for different types of data.
 */
export class SyntaxValidationProvider {
    private static _instance: SyntaxValidationProvider;
    public static usernameRegEx = /^[\w]{5,30}$/i;  //5 a 30 caracteres alfanuméricos
    public static passwordRegEx = /.{5,30}$/i;  //5 a 30 caracteres alfanuméricos
    public static companyNameRegEx = /.{1,30}$/i;  //5 a 30 caracteres alfanuméricos
    public static descriptionRegEx = /.{0,300}$/i;  //5 a 300 caracteres alfanuméricos
    public static firstNameRegEx = /.{2,60}$/i;  //2 a 60 caracteres alfanuméricos
    public static surNameRegEx = /.{2,60}$/i;  //2 a 60 caracteres alfanuméricos
    public static cutDateRegEx = /^[0-9]{3,20}$/i;
    public static inscriptionDateRegEx = /^[0-9]{3,20}$/i;
    public static paymentAmmountRegEx = /^[0-9]{2,20}$/i;  
    public static addPaymentAmmountRegEx = /^[0-9.,]{2,20}$/i;  
    public static phoneValidatorRegEx = /.{0,20}$/i;
    public static addressRegEx = /.{0,300}$/i;  //5 a 20 caracteres alfanuméricos
    public static paymentNotesRegEx = /.{0,300}$/i;  //5 a 20 caracteres alfanuméricos

    public static validateDocumentContent:any = {
        [`${DOCUMENT_PREFIXES.CI}`]: function(value:string): boolean{
            const rgEx = /^[0-9.,]{3,20}$/;
            return rgEx.test(value);
        },
        [`${DOCUMENT_PREFIXES.P}`]: function(value:string): boolean{
            const rgEx = /^[0-9]{7,20}$/;
            return rgEx.test(value);
        }
    }

    public validatePaymentAmmount(payment:string, allowedDecimals: number){
        switch(allowedDecimals){
            case 0:
                return /^(\d){0,}([.|,](\d){1,2}){0}$/.test(payment);
            case 1:
                return /^(\d){0,}([.|,](\d){1,2}){0,1}$/.test(payment);
            case 2:
                return /^(\d){0,}([.|,](\d){1,2}){0,2}$/.test(payment);
            default:
                return /^(\d){0,}([.|,](\d){1,2}){0,2}$/.test(payment);
        }
    }

    constructor(){

    }

    public validatePhone(phone:string){
        return SyntaxValidationProvider.phoneValidatorRegEx.test(phone);
    }

    public validateAddress(address:string){
        return SyntaxValidationProvider.addressRegEx.test(address);
    }

    public validateFirstName(firstName:string){
        return SyntaxValidationProvider.firstNameRegEx.test(firstName);
    }

    public validateSurName(firstName:string){
        return SyntaxValidationProvider.surNameRegEx.test(firstName);
    }

    public validateUsername(username: string) : boolean {
        return (username && SyntaxValidationProvider.usernameRegEx.test(username));
    }

    public validatePassword(password: string): boolean{
        return (password && SyntaxValidationProvider.passwordRegEx.test(password));
    }

    public static get Instance(): SyntaxValidationProvider {
        SyntaxValidationProvider._instance = (SyntaxValidationProvider._instance) ? 
        SyntaxValidationProvider._instance : new SyntaxValidationProvider();
        return SyntaxValidationProvider._instance;
    }

    validateSuperAdminCreationPayload(payload: ISuperAdminCreationPayload):IValidateSuperAdminPayloadResult {        
        if(!payload.username
        || !SyntaxValidationProvider.usernameRegEx.test(payload.username)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_USERNAME
            }
        }
        if(!payload.password
        || !SyntaxValidationProvider.passwordRegEx.test(payload.password)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_PASSWORD
            }
        }
        if(!payload.firstName
        || !SyntaxValidationProvider.firstNameRegEx.test(payload.firstName)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_FIRST_NAME
            }
        }
        if(!payload.surName
        || !SyntaxValidationProvider.surNameRegEx.test(payload.surName)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_SURNAME
            }
        }
        if(payload.address
        && !SyntaxValidationProvider.addressRegEx.test(payload.address)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_ADDRESS
            }
        }
        if(payload.phone
        && !SyntaxValidationProvider.phoneValidatorRegEx.test(payload.phone)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_ADDRESS
            }
        }

        return {
            valid:true,
            code:ValidPayloadCodes.VALID_PAYLOAD
        }
    }

    validateCompanyUpdatePayload(payload: ICompanyUpdatePayload): IValidateCompanyPayloadResult {
            if(payload.name){
                if(!SyntaxValidationProvider.companyNameRegEx.test(payload.name)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_NAME
                    }
                }
            }

            if(payload.description){
                if(!SyntaxValidationProvider.descriptionRegEx.test(payload.description)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_DESCRIPTION
                    }
                }
            }
            
            if(Object.keys(payload).length<1){
                return {
                    valid: false,
                    code: SyntaxErrorCodes.INVALID_FIELD_COUNT
                }
            }
    
            return {
                valid:true,
                code:ValidPayloadCodes.VALID_PAYLOAD
            }
    }

    validateSuperAdminUpdatePayload(payload: ISuperAdminUpdatePayload): IValidateSuperAdminPayloadResult {
            if(payload.username){
                if(!SyntaxValidationProvider.usernameRegEx.test(payload.username)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_USERNAME
                    }
                }
            }
            if(payload.password){
                if(!SyntaxValidationProvider.passwordRegEx.test(payload.password)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_PASSWORD
                    }
                }
            }
            if(payload.firstName){
                if(!SyntaxValidationProvider.firstNameRegEx.test(payload.firstName)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_FIRST_NAME
                    }
                }
            }
            if(payload.surName){
                if(!SyntaxValidationProvider.surNameRegEx.test(payload.surName)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_SURNAME
                    }
                }
            }
    
            if(Object.keys(payload).length<1){
                return {
                    valid: false,
                    code: SyntaxErrorCodes.INVALID_FIELD_COUNT
                }
            }
    
            return {
                valid:true,
                code:ValidPayloadCodes.VALID_PAYLOAD
            }
    }

    validateAdminCreationPayload(payload: IAdminCreationPayload):IValidateAdminPayloadResult {        
        if(!payload.username
        || !SyntaxValidationProvider.usernameRegEx.test(payload.username)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_USERNAME
            }
        }
        if(!payload.password
        || !SyntaxValidationProvider.passwordRegEx.test(payload.password)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_PASSWORD
            }
        }
        if(!payload.firstName
        || !SyntaxValidationProvider.firstNameRegEx.test(payload.firstName)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_FIRST_NAME
            }
        }
        if(!payload.surName
        || !SyntaxValidationProvider.surNameRegEx.test(payload.surName)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_SURNAME
            }
        }
        if(payload.address
        && !SyntaxValidationProvider.addressRegEx.test(payload.address)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_ADDRESS
            }
        }
        if(payload.phone
        && !SyntaxValidationProvider.phoneValidatorRegEx.test(payload.phone)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_PHONE
            }
        }

        if(payload.document){
            if(!payload.document.content
            || SyntaxValidationProvider.validateDocumentContent[payload.document.prefix] === undefined
            || !SyntaxValidationProvider.validateDocumentContent[payload.document.prefix](payload.document.content)){
                return {
                    valid: false,
                    code: SyntaxErrorCodes.INVALID_DOCUMENT_CONTENT_PROVIDED
                }
            }
        }

        return {
            valid:true,
            code:ValidPayloadCodes.VALID_PAYLOAD
        }
    }

    validateAdminUpdatePayload(payload: IAdminUpdatePayload): IValidateSuperAdminPayloadResult {
            if(payload.username){
                if(!SyntaxValidationProvider.usernameRegEx.test(payload.username)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_USERNAME
                    }
                }
            }
            if(payload.password){
                if(!SyntaxValidationProvider.passwordRegEx.test(payload.password)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_PASSWORD
                    }
                }
            }
            if(payload.firstName){
                if(!SyntaxValidationProvider.firstNameRegEx.test(payload.firstName)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_FIRST_NAME
                    }
                }
            }
            if(payload.surName){
                if(!SyntaxValidationProvider.surNameRegEx.test(payload.surName)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_SURNAME
                    }
                }
            }
            if(payload)
    
            return {
                valid:true,
                code:ValidPayloadCodes.VALID_PAYLOAD
            }
    }

    validateClientCreationPayload(payload: IClientCreationPayload): IValidateClientCreationPayloadResult {        
        if(!payload.firstName
        || !SyntaxValidationProvider.firstNameRegEx.test(payload.firstName)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_FIRST_NAME
            }
        }
        if(!payload.surName
        || !SyntaxValidationProvider.surNameRegEx.test(payload.surName)){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_SURNAME
            }
        }

        if(!payload.document){
            return {
                valid: false,
                code: SyntaxErrorCodes.DOCUMENT_NOT_PROVIDED
            }
        }

        if(!payload.document.prefix || !(payload.document.prefix in DOCUMENT_PREFIXES)
        ){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_PREFIX_PROVIDED
            }
        }

        if(!payload.document.content || 
            !(SyntaxValidationProvider.validateDocumentContent[payload.document.prefix])
            ||
            !(SyntaxValidationProvider.validateDocumentContent[payload.document.prefix](payload.document.content))
        ){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_DOCUMENT_CONTENT_PROVIDED
            }
        }

        if(payload.document && payload.document.image){
            if(payload.document.image){
                //Future Image Validation Here
            }
        }

        if(!Object.keys(payload).length){
            //console.log(Object.keys(payload));
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_FIELD_COUNT
            }
        }

        return {
            valid:true,
            code:ValidPayloadCodes.VALID_PAYLOAD
        }
    }

    validateClientUpdatePayload(payload: IClientUpdatePayload): IValidateSuperAdminPayloadResult {
            if(payload.firstName){
                if(!SyntaxValidationProvider.firstNameRegEx.test(payload.firstName)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_FIRST_NAME
                    }
                }
            }
            if(payload.surName){
                if(!SyntaxValidationProvider.surNameRegEx.test(payload.surName)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_SURNAME
                    }
                }
            }
            if(payload.document){
                if(!payload.document.prefix || !(payload.document.prefix in DOCUMENT_PREFIXES)
                ){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_PREFIX_PROVIDED
                    }
                }

                if(!payload.document.content || 
                    !(SyntaxValidationProvider.validateDocumentContent[payload.document.prefix])
                    ||
                    !(SyntaxValidationProvider.validateDocumentContent[payload.document.prefix](payload.document.content))
                ){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_DOCUMENT_CONTENT_PROVIDED
                    }
                }
            }

            if(payload.membership){
                if(payload.membership.cutDate && !SyntaxValidationProvider.cutDateRegEx.test(`${payload.membership.cutDate}`)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_CUT_DATE
                    }
                }
                if(payload.membership.inscriptionDate && !SyntaxValidationProvider.inscriptionDateRegEx.test(`${payload.membership.inscriptionDate}`)){
                    return {
                        valid: false,
                        code: SyntaxErrorCodes.INVALID_INSCRIPTION_DATE
                    }
                }
            }
    
            if(Object.keys(payload).length<1){
                return {
                    valid: false,
                    code: SyntaxErrorCodes.INVALID_FIELD_COUNT
                }
            }
    
            return {
                valid:true,
                code:ValidPayloadCodes.VALID_PAYLOAD
            }
    }

    validatePaymentAddPayload(payload: IPaymentAddPayload): IValidatePaymentAddPayloadResult {        
        if(!payload.payment.ammount || !payload.payment.currency){
            if(!payload.payment.currency){
                return {
                    valid: false,
                    code: SyntaxErrorCodes.INVALID_CURRENCY_PROVIDED
                }
            }
            if(!payload.payment.ammount){
                return {
                    valid: false,
                    code: SyntaxErrorCodes.INVALID_AMMOUNT_PROVIDED
                }
            }
            if(!payload.payment.method && !(payload.payment.method in PAYMENT_METHODS)){
                return {
                    valid: false,
                    code: SyntaxErrorCodes.INVALID_PAYMENT_METHOD
                }
            }
        }
        if(payload.membership){
            if((typeof payload.membership.cutDate !== "undefined") && !SyntaxValidationProvider.cutDateRegEx.test(`${payload.membership.cutDate}`)){
                return {
                    valid: false,
                    code: SyntaxErrorCodes.INVALID_CUT_DATE
                }
            }
            if((typeof payload.membership.monthAmmount !== "undefined") && !SyntaxValidationProvider.paymentAmmountRegEx.test(`${payload.membership.monthAmmount}`)){
                return {
                    valid: false,
                    code: SyntaxErrorCodes.INVALID_MONT_AMMOUNT
                }
            }
        }

        if(!Object.keys(payload).length){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_FIELD_COUNT
            }
        }

        return {
            valid:true,
            code:ValidPayloadCodes.VALID_PAYLOAD
        }
    }

    validateRoleUpdatePayload(payload: IRoleUpdatePayload): IValidateRoleUpdatePayloadResult {
        
        if(!payload.role){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_FIELD_COUNT
            }
        }
        Object.keys(payload.role).forEach((roleKey:any)=>{
            if(typeof payload.role[roleKey] !== "boolean"){
                return {
                    valid: false,
                    code: SyntaxErrorCodes.INVALID_ROLE_ACTION
                }
            }
        });

        if(!Object.keys(payload).length){
            return {
                valid: false,
                code: SyntaxErrorCodes.INVALID_FIELD_COUNT
            }
        }

        return {
            valid:true,
            code:ValidPayloadCodes.VALID_PAYLOAD
        }
    }


    public static normalizeDocumentContentFunctions = {
        [DOCUMENT_PREFIXES.CI]:(content:string)=>{
            if(!content || content.length<3){
                return content;
            }
            return numeral(parseInt(
                SyntaxValidationProvider
                .normalizeDocumentContentFunctions_clean[DOCUMENT_PREFIXES.CI](content)
            )).format("100,000,000,000,000,000").replace(/,/g, '.');
        }
    }

    public static normalizeDocumentContentFunctions_clean = {
        [DOCUMENT_PREFIXES.CI]:(content:string)=>{
            let clean:string = content;
            try{
                clean = content.replace(/[^\d]/g, '');
            }catch(e){
                console.log(e);            
            }
            return clean;
        }
    }



  /**
   * 
   * @description  Returns an appropiate integer to store into the database
   * @param ammount Ammount with decimals (p.e.: 650.30)
   * @param currencyDecimals Ammount of decimals that currency has.
   * @returns     An appropiate integer to store into the database
   */
  ammountToInteger(ammount: string, currencyDecimals: number) {
    let format = "1,000,000,000." + ("0".repeat(currencyDecimals));
    let numeralString = numeral(numeral(ammount).value()).format(format);
    return parseInt(numeralString.replace(/[.,]/g, ''));
  }

  /**
   * @description Turns integer 250030 to floating type 2500.30, to work with inputs.
   * @param integer Integer that will be converted to floating point number. (ex. 250030)
   * @param currencyDecimals Decimals that has that coin.   (ex. 2)
   * @returns Returns a floating point number. If fraction is 0, retorna un entero.
   */
  integerToFloat(integer:number, currencyDecimals:number){
    let integerA = `${integer}`.split("").splice(0, `${integer}`.length-currencyDecimals).join("");
    let integerB = `${integer}`.split("").splice(`${integer}`.length-currencyDecimals, `${integer}`.length).join("");
    let integerC = parseFloat(`${integerA}.${integerB}`);
    return integerC;
  }

  integerToAmmount(ammount: number | string, currencyDecimals: number, separator ? : string) {
    let format = "1,000,000,000,000.00";
    let subA = `${ammount}`.split("").splice(0, `${ammount}`.length - currencyDecimals).join('');
    let subB = `${ammount}`.split("").splice(`${ammount}`.length - currencyDecimals, `${ammount}`.length).join('');
    let subC = numeral(numeral(`${subA}.${subB}`).value()).format(format)
    return subC;
  }

}

/**
 * @description Validates the search data for the user search functionality
 */
export class UserSearchValidator implements IUserSearchValidator {

    public allowedTables:string[] = ['membership','role','jwt','login','document','user'];
    validFields:string[];

    public getFieldNames(table:string){
        let newObj:any = {};
        let currentObj:any;
        if(table === "login"){
            currentObj = TableNames.Login
        }
        if(table === "jwt"){
            currentObj = TableNames.Jwt;
        }
        if(table === "document"){
            currentObj = TableNames.Document;
        }
        if(table === "membership"){
            currentObj = TableNames.Membership;
        }
        if(table === "role"){
            currentObj = TableNames.Role;
        }
        if(table === "user"){
            currentObj = TableNames.User;
        }
        if(currentObj){
            Object.keys(currentObj).forEach((fieldValue:string)=>{
                (<any>newObj)[fieldValue.replace('field_','')] = (<any>currentObj)[fieldValue];
            });
        }else{
            console.log("SyntaxValidatoProdivder -- TableName  not found... ",table)
        }
        return newObj;
    }

    public getValidFields(table:string){
        let fields = Object.keys(this.getFieldNames(table));
        let lowercaseFields:string[] = [];
        fields.forEach((field:string)=>{
            lowercaseFields.push(field.toLowerCase());
        });
        return lowercaseFields;
    }
   
    id(value:any){
        return true;
    }
   
    createdAt(value:any){
        return true;
    }
   
    updatedAt(value:any){
        return true;
    }
   
    firstName(value:any){
        return true;
    }


    surName(vaue:any){
        return true;
    }


    prefix(value:any){
        return true;
    }


    content(value:any){
        return true;
    }


    cutDate(value:any){
        return true;
    }


    inscriptionDate(value:any){
        return true;
    }


    company(value:any){
        return true;
    }


    username(value:any){
        return true;
    }


    token(value:any){
        return true;
    }


    canLogin(value:any){
        return true;
    }


    canChangePassword(value:any){
        return true;
    }


    canAddAdmin(value:any){
        return true;
    }


    canUpdateAdmin(value:any){
        return true;
    }


    canRemoveAdmin(value:any){
        return true;
    }


    canSearchAdmin(value:any){
        return true;
    }


    canExportData(value:any){
        return true;
    }


    canImportData(value:any){
        return true;
    }


    canIncorporateClient(value:any){
        return true;
    }


    canUpdateClient(value:any){
        return true;
    }


    canDesincorporateClient(value:any){
        return true;
    }


    canSearchClient(value:any){
        return true;
    }


    canAddPayment(value:any){
        return true;
    }


    canUpdatePayment(value:any){
        return true;
    }


    canRemovePayment(value:any){
        return true;
    }


    canSearchPayment(value:any){
        return true;
    }


    canUpdateUserRoles(value:any){
        return true;
    }
}

/**
 * @description Validates the search data for the payment search functionality
 */
export class PaymentSearchValidator {

    public allowedTables:string[] = ['membership','role','jwt','login','document','payment'];
    validFields:string[];

    public getFieldNames(table:string){
        let newObj:any = {};
        let currentObj:any;
        if(table === "membership"){
            currentObj = TableNames.Membership;
        }
        if(table === "payment"){
            currentObj = TableNames.Payment;
        }
        if(currentObj){
            Object.keys(currentObj).forEach((fieldValue:string)=>{
                (<any>newObj)[fieldValue.replace('field_','')] = (<any>currentObj)[fieldValue];
            });
        }else{
            console.log("SyntaxValidatoProdivder -- TableName  not found... ",table)
        }
        return newObj;
    }

    public getValidFields(table:string){
        let fields = Object.keys(this.getFieldNames(table));
        let lowercaseFields:string[] = [];
        fields.forEach((field:string)=>{
            lowercaseFields.push(field.toLowerCase());
        });
        return lowercaseFields;
    }
}

/**
 * @description Validates the search data for the log search functionality
 */
export class LogSearchValidator {

    public allowedTables:string[] = ['log','user'];
    validFields:string[];

    public getFieldNames(table:string){
        let newObj:any = {};
        let currentObj:any;
        if(table === "log"){
            currentObj = TableNames.Log;
        }
        if(table === "user"){
            currentObj = TableNames.User;
        }
        if(currentObj){
            Object.keys(currentObj).forEach((fieldValue:string)=>{
                (<any>newObj)[fieldValue.replace('field_','')] = (<any>currentObj)[fieldValue];
            })
        }else{
            console.log("\n\n\n\n\n SyntaxValidatoProdivder -- TableName  not found... ",table)
        }
        return newObj;
    }

    public getValidFields(table:string){
        let fields = Object.keys(this.getFieldNames(table));
        let lowercaseFields:string[] = [];
        fields.forEach((field:string)=>{
            lowercaseFields.push(field.toLowerCase());
        });
        return lowercaseFields;
    }
}