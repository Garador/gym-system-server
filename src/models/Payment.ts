import { Entity, OneToOne, UpdateDateColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import {ITableMetadata} from '../interfaces/TableStructure';
import {TableNames} from '../enums/Database';
import { Membership } from "./Membership";
import {Currency} from './Currency';
import { toJson } from "../interfaces/Socket";
export enum EPaymentType {
    EFECTIVO = 0,
    TRANSFERENCIA = 1
}

@Entity({
    name: TableNames.Payment.table_name
})
export class Payment implements ITableMetadata {
    
    //+Metadata
    @PrimaryGeneratedColumn({
    //@PrimaryColumn({
        name: TableNames.Payment.id
    })
    id: number;

    @CreateDateColumn({
        name: TableNames.Payment.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: TableNames.Payment.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.Payment.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name: TableNames.Payment.ammount
    })
    ammount: number;
    
    @Column({
        name: TableNames.Payment.payment_method
    })
    paymentMethod: number;  //EPaymentType

    @Column({
        name: TableNames.Payment.notes,
        length: 600,
        nullable: true
    })
    notes: string;
    //-Columnas


    //+Llaves Foraneas
    @ManyToOne(type => Currency, currency => currency.payments)
    @JoinColumn({
        name: TableNames.Payment.foreign_key_currency
    })
    currency: Currency;

    @ManyToOne(type => Membership, membership => membership.payments)
    @JoinColumn({
        name: TableNames.Payment.foreign_key_membership
    })
    membership: Membership;

    public toJson(): toJson.IPayment{
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            ammount: this.ammount,
            paymentMethod: this.paymentMethod,
            notes: this.notes,
            currency: (this.currency instanceof Currency) ? this.currency.id : this.currency,
            membership: (this.membership instanceof Membership) ? this.membership.toJson() : this.membership,
        }
    }

    //-Llaves Foraneas

}