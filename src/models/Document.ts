import { Entity, UpdateDateColumn, JoinColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, OneToOne, BeforeInsert, BeforeUpdate } from "typeorm";
import {User} from './User';
import {TableNames} from '../enums/Database';
import {ITableMetadata} from '../interfaces/TableStructure';
import { toJson } from "../interfaces/Socket";
import { SyntaxValidationProvider } from "../providers/SyntaxValidationProvider";
import { DocumentStatus } from "../enums/Document";

@Entity({
    name: TableNames.Document.table_name
})
export class Document implements ITableMetadata {

    //+Metadata
    @PrimaryGeneratedColumn({
    //@PrimaryColumn({
        name:TableNames.Document.id
    })
    id: number;

    @CreateDateColumn({
        name:TableNames.Document.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name:TableNames.Document.updatedAt
    })
    updatedAt: Date;

    @Column({
        name:TableNames.Document.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name:TableNames.Document.prefix,
        length:4
    })
    prefix: string;

    @Column({
        name:TableNames.Document.content,
        length:60
    })
    content: string;

    @Column({
        name:TableNames.Document.image,
        nullable: true
    })
    image: string;
    //-Columnas

    //+Lláves Foráneas
    @OneToOne(type => User, user => user.document,{nullable: true})
    @JoinColumn({ name: TableNames.Document.foreign_key_user})
    user: User;
    //-Lláves Foráneas

    toJson(): toJson.IDocument{
        return <toJson.IDocument>{
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            prefix: this.prefix,
            content: this.content,
            image: this.image,
            user: (this.user instanceof User) ? this.user.id : null
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    normalize() {
        this.status = (this.status === undefined || this.status === null) ? DocumentStatus.ACTIVE : this.status;
        if(SyntaxValidationProvider.normalizeDocumentContentFunctions_clean[this.prefix]){
            //this.content = (this.content && this.prefix) ? SyntaxValidationProvider.normalizeDocumentContentFunctions[this.prefix](this.content) : this.content;
        }
    }
    

}