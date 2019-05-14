import { Entity, UpdateDateColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn, Table } from "typeorm";
import {TableNames} from '../../enums/Database';
import {ITableMetadata} from '../../interfaces/TableStructure';
import { toJson } from "../../interfaces/Socket";


@Entity({
    name: TableNames.LogContent.table_name
})
export class LogContent implements ITableMetadata {

    //+Metadata
    @PrimaryGeneratedColumn({
        name:TableNames.LogContent.id
    })
    id: number;

    @Column({
        name: TableNames.LogContent.log_id
    })
    logId: number;

    @CreateDateColumn({
        name:TableNames.LogContent.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name:TableNames.LogContent.updatedAt
    })
    updatedAt: Date;

    @Column({
        name:TableNames.LogContent.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name:TableNames.LogContent.previous_value, nullable: true
    })
    previousValue: string;

    @Column({
        name:TableNames.LogContent.next_value, nullable: true
    })
    newValue: string;
    
    //-Columnas
    //+Lláves Foráneas
    //-Lláves Foráneas

    toJson():toJson.ILogcontent {
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            logId: this.logId,
            status: this.status,
            previousValue: this.previousValue,
            newValue: this.newValue
        }
    }

}