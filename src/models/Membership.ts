import {
    Entity,
    OneToOne,
    UpdateDateColumn,
    Column,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    FindManyOptions
} from "typeorm";
import {
    User
} from './User';
import {
    ITableMetadata
} from '../interfaces/TableStructure';
import {
    Company
} from './Company';
import {
    Payment
} from './Payment';
import {
    TableNames
} from '../enums/Database';
import {
    DatabaseService
} from "../providers/databaseAdmin";
import { toJson } from "../interfaces/Socket";

@Entity({
    name: TableNames.Membership.table_name
})
export class Membership implements ITableMetadata {

    //+Metadata
    @PrimaryGeneratedColumn({
        //@PrimaryColumn({
        name: TableNames.Membership.id
    })
    id: number;

    @CreateDateColumn({
        name: TableNames.Membership.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: TableNames.Membership.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.Membership.status
    })
    status: number;
    //-Metadata

    //+Columnas
    @Column({
        name: TableNames.Membership.cut_date,
        nullable: true
    })
    cutDate: Date;

    @Column({
        name: TableNames.Membership.inscription_date,
        nullable: true
    })
    inscriptionDate: Date;

    @Column({
        name: TableNames.Membership.month_ammount,
        nullable: true
    })
    monthAmmount: number;
    //-Columnas

    //+Llaves Foraneas
    @ManyToOne(type => Company, company => company.memberships)
    @JoinColumn({
        name: TableNames.Membership.foreign_key_company
    })
    company: Company;

    @OneToOne(type => User, user => user.membership)
    @JoinColumn({
        name: TableNames.Membership.foreign_key_user
    })
    user: User;
    //-Llaves Foraneas

    //+Relaciones
    @OneToMany(type => Payment, payment => payment.membership, {
        cascade: ['insert', 'update']
    })
    payments: Payment[];

    toJson(): toJson.IMembership{
        return <toJson.IMembership> {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            cutDate: this.cutDate,
            monthAmmount: this.monthAmmount,
            inscriptionDate: this.inscriptionDate,
            company: (this.company instanceof Company) ? this.company.id : null,
            user: (this.user instanceof User) ? this.user.id : null
        }
    }

    public async loadPayments(paging?:{skip?:number, take?:number}) {
        this.payments = await DatabaseService.Instance.connection.getRepository(Payment).find({
            where:{
                membership: this
            }
            ,skip:(paging && paging.skip) ? paging.skip : 0
            ,take:(paging && paging.take) ? paging.take : 0
        });
    }

    public static async addPayment(payment: Payment, membership:Membership) {
        payment.membership = membership;
        payment = await DatabaseService.Instance.connection.getRepository(Payment).save(payment);
        return payment;
    }



}