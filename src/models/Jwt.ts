import { Entity, UpdateDateColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from "typeorm";
import {TableNames} from '../enums/Database';
import {User} from './User';
import {ITableMetadata} from '../interfaces/TableStructure';
import { toJson } from "../interfaces/Socket";

@Entity({
    name:TableNames.Jwt.table_name
})
export class Jwt implements ITableMetadata {

    //+Metadata
    @PrimaryGeneratedColumn({
    //@PrimaryColumn({
        name:TableNames.Jwt.id
    })
    id: number;

    @CreateDateColumn({
        name:TableNames.Jwt.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name:TableNames.Jwt.updatedAt
    })
    updatedAt: Date;

    @Column({
        name:TableNames.Jwt.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name:TableNames.Jwt.token,
        nullable: true
    })
    token: string;
    //-Columnas

    //+ForeigKeys
    @OneToOne(type => User, user => user.jwt, {nullable: true})
    @JoinColumn({
        name:TableNames.Jwt.foreign_key_user        
    })
    user: User;
    //-ForeignKeys



    toJson(): toJson.IJwt{
        return {
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            status: this.status,
            token: this.token,
            user: this.user ? this.user.id : null
        }
    }
}