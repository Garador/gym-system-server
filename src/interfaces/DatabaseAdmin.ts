export interface ConnectionConf {
    primary:ConnectionConfData,
    audit:ConnectionConfData
}

export interface ConnectionConfData {
    connection:{
        name: string,
        type: string,
        synchronize: boolean,
        logging: boolean,
        logger: string,
        database:string,
        generationStrategy: string,
        entities: Array<Object>,
    }
}