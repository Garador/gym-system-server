import { Entity, OneToOne, UpdateDateColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import {ITableMetadata} from '../interfaces/TableStructure';
import {TableNames} from '../enums/Database';
import { Membership } from "./Membership";
import { DatabaseService } from "../providers/databaseAdmin";
import { ICompanyUpdatePayload, ICompanyUpdateResult } from "../interfaces/Company";
import { SyntaxValidationProvider } from "../providers/SyntaxValidationProvider";
import { CompanyUpdateResult } from "../enums/Company";
import { toJson } from "../interfaces/Socket";

@Entity({
    name: TableNames.Company.table_name
})
export class Company implements ITableMetadata {
    
    //+Metadata
    //@PrimaryGeneratedColumn({
    @PrimaryColumn({
        name: TableNames.Company.id
    })
    id: number;

    @CreateDateColumn({
        name: TableNames.Company.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: TableNames.Company.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.Company.status,
        type:'integer'
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name: TableNames.Company.description
    })
    description: string;

    @Column({
        name: TableNames.Company.name
    })
    name: string;
    //-Columnas

    //+Llaves Foraneas
    //-Llaves Foraneas

    //Relaciones sin llaves foráneas
    @OneToMany(type => Membership, membership => membership.company)
    memberships: Membership[];
    //-Relaciones

    public static async getBaseCompany(): Promise<Company> {
        let company:Company = await DatabaseService.Instance.connection.getRepository(Company)
        .findOne();
        return company;
    }

    public toJson(): toJson.ICompany{
        return {
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            status: this.status,
            description: this.description,
            name: this.name,
            memberships:(()=>{
                let returnArray:toJson.IMembership[] = [];
                if(this.memberships){
                    this.memberships.forEach(membership=>{
                        returnArray.push(membership.toJson())
                    });
                }
                return returnArray;
            })()
        }
    }


    public async updateCompany(payload: ICompanyUpdatePayload): Promise < ICompanyUpdateResult > {
        //0. Validamos Payload.
        try {
            let validationResult = SyntaxValidationProvider.Instance.validateCompanyUpdatePayload(payload);
            if (validationResult.valid) {
                //1. Obtenemos SuperAdmin.
                if (this.id == undefined) {
                    return {
                        updated: false,
                        message: validationResult,
                        result: CompanyUpdateResult.COMPANY_NOT_LOADED
                    }
                };
                this.description = (payload.description) ? payload.description : this.description;
                this.name = (payload.name) ? payload.name : this.name;
                try{
                    await DatabaseService.Instance.connection.getRepository(Company).save(this);
                }catch(e){
                    return {
                        updated: true,
                        message: e,
                        result: CompanyUpdateResult.ERROR
                    }
                }
                return {
                    updated: true,
                    message: validationResult,
                    result: CompanyUpdateResult.SUCCESS
                }
            } else {
                return {
                    updated: false,
                    message: validationResult,
                    result: CompanyUpdateResult.INVALID_DATA
                }
            }
        } catch (e) {
            return {
                updated: false,
                message: e,
                result: CompanyUpdateResult.ERROR
            }
        }
    }

}