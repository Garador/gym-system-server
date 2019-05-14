import { Entity, OneToOne, UpdateDateColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import {User} from './User';
import {TableNames} from '../enums/Database';
import {ITableMetadata} from '../interfaces/TableStructure';
import { PasswordManager } from "../providers/PasswordManager";
import {IHashPasswordResult} from '../interfaces/PasswordManager';
import { toJson } from "../interfaces/Socket";

@Entity({
    name: TableNames.Login.table_name
})
export class Login implements ITableMetadata {
    
    //+Metadata
    @PrimaryGeneratedColumn({
    //@PrimaryColumn({
        name: TableNames.Login.id
    })
    id: number;

    @CreateDateColumn({
        name: TableNames.Login.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: TableNames.Login.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.Login.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name: TableNames.Login.username,
        length: 20,
        unique: true
    })
    username: string;

    @Column({
        name: TableNames.Login.salt,
        length: 60
    })
    salt: string;
    
    @Column({
        name: TableNames.Login.hash,
        length: 260
    })
    hash: string;
    
    @Column({
        name: TableNames.Login.algorithm,
        length: 20
    })
    algorithm: string;
    //-Columnas

    //+Llaves Foraneas
    @OneToOne(type => User, user => user.login, {nullable:true})
    @JoinColumn({
        name: TableNames.Login.foreign_key_user,
    })
    user: User;
    //-Llaves Foraneas

    toJson(): toJson.ILogin{
        return <toJson.ILogin>{
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            status: this.status,
            username: this.username,
            salt: this.salt,
            hash: this.hash,
            algorithm: this.algorithm,
            user: (this.user instanceof User) ? this.user.id : null
        }
    }



    /**
     * @param unprotectedPassword The password to protect
     * @description Salts the password and returns the produced salt.
     */
    public setPassword(unprotectedPassword: string): string{
        let hashingResult: IHashPasswordResult = PasswordManager.saltHashPassword(unprotectedPassword, PasswordManager.getRandomString(80));
        this.hash = hashingResult.hashValue;
        this.salt = hashingResult.salt;
        this.algorithm = hashingResult.algorithm;
        return this.salt;
    }


    public hasPassword(rawPassword: string) : boolean {
        return PasswordManager.hasPassword(rawPassword, this.salt, this.hash);

    }

}