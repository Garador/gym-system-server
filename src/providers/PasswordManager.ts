import * as crypto from 'crypto';
import { User } from '../models/User';
import { DatabaseService } from './databaseAdmin';
import * as JWT from 'jsonwebtoken';
import { Jwt } from '../models/Jwt';
import { JWTStatus } from '../enums/Jwt';
import { HASH_ALGORITHM, IHashPasswordResult, ITokenInternalContent, ITokenInterface, ITokenVerifyResult, ETokenVerifyResult } from '../interfaces/PasswordManager';

const JSON_WEB_TOKEN_KEY = process.env['JSONWEBTOKEN_KEY'] || "ga084Oj2!7anlmgdxB8xwRj0fm5$qf!c47OI5*7M!l@zJhE*Ex@j2CGFajwn";

const expire_span = (60*60*72); //72 hours expire span for the JWT


export class PasswordManager {

    constructor(){

    }

    /**
     * 
     * @param length Length of the generated string
     * @description Generates a random string with certain length
     */
    public static getRandomString(length: number){
        return crypto.randomBytes(Math.ceil(length/2))
        .toString()
        .slice(0,length);
    }

    /**
     * @param {password} : The unhashed password
     * @param {alg}: The ENUM for the used hashing algorithm.
     * @param {salt}: The salt to be used.
     * @description Hash password with sha512
     */
    public static hashPassword(alg: HASH_ALGORITHM, password: string, salt: string): IHashPasswordResult{
        switch(alg){
            case HASH_ALGORITHM.SHA512:                
                let hash = crypto.createHmac('sha512', salt);
                hash.update(password);
                let hashValue = hash.digest('hex');
                return {
                    salt: salt,
                    algorithm: alg,
                    hashValue: hashValue
                };
            default:
                throw new Error('Hash algorithm not specified...');
        }
    }
    /**
     * 
     * @param password Unprotected Password
     * @description Creates and Sets the password for the user, setting this.passwordSalt, this.passwordHash and this.passwordAlg.
     */
    public static saltHashPassword(password: string, salt:string){
        return PasswordManager.hashPassword(HASH_ALGORITHM.SHA512, password, salt);
    }

    /**
     * @param password Unprotected password.
     * @param passwordHash Password hash to compare to
     * @param passwordSalt Salt of the hash password.
     * @description Checks wether the provided password is the user's password.
     */
    public static hasPassword(password: string, passwordSalt:string, passwordHash: string){
        let hashedPassword = PasswordManager.saltHashPassword(password, passwordSalt).hashValue;
        return (hashedPassword === passwordHash);
    }

    /**
     * @param user User object to generate the token for auth purposes
     * @param database Database instance service
     * @description Genera un objeto jwt en la base de datos
     * @returns Devuelve un string JWT y 
     */
    public static async generateJWToken(user: User): Promise<ITokenInterface> {
        user.jwt = user.jwt ? user.jwt : new Jwt();
        if(!user.login){
            throw new Error('Login not provided');
        }
        user.jwt.status = JWTStatus.ACTIVE;    //Logged-In
        await DatabaseService.Instance.connection.getRepository(User).save(user);
        let tokenData:ITokenInternalContent = {
            exp: Math.floor(Date.now()/1000)+expire_span,
            _id:user.jwt.id,
            user:{
                id:user.id,
                userName:user.login.username,
                role:user.role || null
            }
        };
        user.jwt.token = JWT.sign(tokenData, JSON_WEB_TOKEN_KEY);
        await DatabaseService.Instance.connection.getRepository(User).save(user);
        return {
            data:tokenData,
            token: user.jwt.token,
            jwt: user.jwt
        };
    }

    public static async hasValidJWT(jwt:string): Promise<boolean | ITokenVerifyResult>{
        let tokenData = PasswordManager.verifyJWToken(jwt);
        if(tokenData.code === ETokenVerifyResult.Success){
            //Fetch token. Check status == 1
            let token = await DatabaseService.Instance.connection.getRepository(Jwt).findOne((<ITokenInternalContent>tokenData.data)._id);
            return tokenData;
        }else{
            return false;
        }
        

    }

    /**
     * @description Verifies the validity for a JWT
     * @param jwt The JWT string
     */
    public static verifyJWToken(jwt: string): ITokenVerifyResult{
        try{
            let result:ITokenInternalContent = <any>JWT.verify(jwt, JSON_WEB_TOKEN_KEY);
            return {
                code:ETokenVerifyResult.Success,
                data:result
            };
        }catch(e){
            switch(e instanceof JWT.TokenExpiredError){
                case e instanceof JWT.TokenExpiredError:
                return {
                    code:ETokenVerifyResult.TokenExpiredError,
                    data:e
                };

                case e instanceof JWT.JsonWebTokenError:
                return {
                    code:ETokenVerifyResult.JsonWebTokenError,
                    data:e
                };

                case e instanceof JWT.NotBeforeError:
                return {
                    code:ETokenVerifyResult.NotBeforeError,
                    data:e
                };
                default:
                return {
                    code:ETokenVerifyResult.UnknownError,
                    data:e
                }
            }
        }
    }
}