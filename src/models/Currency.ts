import { Entity, OneToOne, UpdateDateColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import {ITableMetadata} from '../interfaces/TableStructure';
import {TableNames} from '../enums/Database';
import { Payment } from "./Payment";
import { DatabaseService } from "../providers/databaseAdmin";
import { toJson } from "../interfaces/Socket";
export enum EPaymentType {
    EFECTIVO = 0,
    TRANSFERENCIA = 1
}

@Entity({
    name: TableNames.Currency.table_name
})
export class Currency implements ITableMetadata {
    
    //+Metadata
    @PrimaryColumn({                    //DICATADA POR ABREVIATURA iso_4217
        name: TableNames.Currency.id
    })
    id: string;

    @CreateDateColumn({
        name: TableNames.Currency.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: TableNames.Currency.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.Currency.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name: TableNames.Currency.iso_4217
    })
    isoCode: number;

    @Column({
        name: TableNames.Currency.decimals
    })
    decimals: number;

    @Column({
        name: TableNames.Currency.display_name
    })
    displayName: string;
    //-Columnas


    //+Llaves Foraneas
    @OneToMany(type => Payment, payment => payment.currency)
    payments: Payment[];
    //-Llaves Foraneas

    public static async getCurrencies() : Promise<Currency[]> {
        let currencies = await DatabaseService.Instance.connection.getRepository(Currency).find();
        return currencies;
    }

    public toJson():toJson.ICurrency{
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            isoCode: this.isoCode,
            decimals: this.decimals,
            displayName: this.displayName,
            payments: (()=>{
                let paymentsToReturn:toJson.IPayment[] = [];
                if(this.payments){
                    this.payments.forEach(payment=>{
                        paymentsToReturn.push(payment.toJson())
                    });
                }
                return paymentsToReturn;
            })()
        }
    }

}