import * as moment from 'moment';
import * as child_process from 'child_process'
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as JSZip from 'jszip';
import {
    decode,
    encodingExists
} from 'iconv-lite';
import * as chardet from 'chardet';

import {
    IExportResult,
    IImportResult,
    IFileUploadResult,
    IParseRecordData,
    ImportFolderResult,
    ExportOperationLoggingLevel
} from '../interfaces/ExportManager';
import {
    ExportResultCode,
    ImportResultCode
} from '../enums/ExportManager';
import {
    Connection,
    createConnection,
    getManager
} from 'typeorm';
import {
    User
} from '../models/User';
import {
    BaseRole
} from '../models/BaseRole';
import {
    Currency
} from '../models/Currency';
import {
    Company
} from '../models/Company';
import {
    DatabaseService
} from './databaseAdmin';
import {
    IRequests
} from '../interfaces/Socket';
import {
    UserContact
} from '../models/UserContact';
import {
    Document as Doc,
    Document
} from '../models/Document';
import {
    Jwt
} from '../models/Jwt';
import {
    Log
} from '../models/Log';
import LogActions from '../base/LogActions';
import {
    Login
} from '../models/Login';
import {
    Membership
} from '../models/Membership';
import {
    Payment
} from '../models/Payment';
import {
    Role
} from '../models/Role';
import {
    LogContent
} from '../models/audit/LogContent';


import {
    MainPath,
    CommandFilePath,
    MainFilePath
} from './const';
import {
    Readable
} from 'stream';
import {
    Parser
} from 'csv-parse';
import {
    DOCUMENT_PREFIXES
} from '../base/DocumentPrefixes';
import {
    MembershipStatus
} from '../enums/Membership';
import {
    PaymentStatus
} from '../enums/Payment';
import {
    DocumentStatus
} from '../enums/Document';
import {
    ClientStatus
} from '../enums/User';
import {
    PAYMENT_METHODS
} from '../enums/PaymentMethods';
import {
    SocketServer
} from '../socket-server';
import {
    SyntaxValidationProvider
} from './SyntaxValidationProvider';
import {
    RoleStatus
} from '../enums/Role';
import { TableNames } from '../enums/Database';

console.log(`


MainPath: ${MainPath}


`);

/**
 * @description Handles the import / export functions for the database data.
 */
export class ExportManager {

    private static _instance: ExportManager;

    constructor() {

    }

    public static get Instance() {
        ExportManager._instance = (ExportManager._instance) ? ExportManager._instance : new ExportManager();
        return ExportManager._instance;
    }

    /**
     * @param data Packet with binary file (buffer) that will be stored into the server
     * @description Method that receives a file to the server and uses it to make a data import
     * operation after writing it
     */
    public async doImportUpload(data: IRequests.Data.ImportFileUpload): Promise < IFileUploadResult > {
        let filePaths = await new Promise < string[] > ((accept) => { //Store files and return filepaths
            let filePaths: string[] = [];

            for (let i = 0; i < data.payload.files.length; i++) {
                if (!(/^(.*)(.zip)$/.test(data.payload.fileNames[i]))) { //Si no es un archivo .zip
                    continue;
                }

                let filePath = this.getRestoreLocation(`${data.payload.fileNames[i]}`);
                try {
                    fs.writeFileSync(filePath, ( < Buffer > data.payload.files[i]));
                    filePaths.push(filePath);
                } catch (e) {
                    console.log(`

                    
                    Error 78 - writing file...
                    
                    
                    `, filePath);
                    console.log(e);
                }
            }
            accept(filePaths);
        });
        let importResult: IImportResult = {
            result: ImportResultCode.ZIP_NAME_ERROR,
            data: null,
            outputFileLocation: null
        };
        if (filePaths.length > 0) {
            //Hacemos la importación
            try {
                importResult = await this.doImport(filePaths[0]);
            } catch (e) {
                console.log(`
                
                
                
                
                
                Error 96 -  making import:
                
                
                `, e);
            }
        }
        return {
            filePaths: filePaths,
            importResult: importResult
        };
    }

    /**
     * @description Realiza una improtación del sistema, basado en un archivo .zip
     * @param zipFilePath La locación absoluta del archivo .zip a importar
     */
    public async doImport(zipFilePath: string): Promise < IImportResult > {

        //1. Descomprimimos archivos.
        let filePath: string = zipFilePath;

        let zipFileName = filePath.split(path.sep).slice(-1)[0];
        let importResult: IImportResult = {
            result: ImportResultCode.SUCCESS,
            data: null,
            outputFileLocation: null
        }

        //Si el archivo a importar es un archivo con nombre de formato dump.
        if (!(/^(\d){4}_(\d){1,2}_(\d){1,2}_(\d){1,2}_(\d){1,2}_(.*)$/.test(zipFileName))) {
            importResult.result = ImportResultCode.ZIP_NAME_ERROR;
            return importResult;
        }

        //Prefijo del archivo.
        let zipFileNamePrefix = zipFileName.match(/^((\d+){1,4}_(\d+){1,2}_(\d+){1,2}_(\d+){1,2}_(\d+){1,2}_(\d+){1,2})(.*)$/)[1];
        if(!fs.existsSync(path.join(MainPath, 'db'))){
            fs.mkdirSync(path.join(MainPath, 'db'));
        }
        if(!fs.existsSync(path.join(MainPath, 'db', 'main'))){
            fs.mkdirSync(path.join(MainPath, 'db', 'main'));
        }
        if (!fs.existsSync(path.join(MainPath, 'db','restore'))) {
            fs.mkdirSync(path.join(MainPath, 'db','restore'));
        }
        if (!fs.existsSync(path.join(MainPath, 'db','restore','test'))) {
            fs.mkdirSync(path.join(MainPath, 'db','restore','test'));
        }

        //let auditDbSQLFile = `${MainPath}db${path.sep}restore${path.sep}test${path.sep}${zipFileNamePrefix}_test_audit.sql`;
        let auditDbSQLFile = path.join(MainPath,'db','restore','test',zipFileNamePrefix+'_test_audit.sql');
        //let mainDbSQLFile = `${MainPath}db${path.sep}restore${path.sep}test${path.sep}${zipFileNamePrefix}_test_main.sql`;
        let mainDbSQLFile = path.join(MainPath,'db','restore','test',zipFileNamePrefix+'_test_main.sql');
        //let mainSQLiteDB = `${MainPath}db${path.sep}restore${path.sep}test${path.sep}${zipFileNamePrefix}_test_main.sqlite`; //Base de datos principal de prueba
        let mainSQLiteDB = path.join(MainPath,'db','restore','test',zipFileNamePrefix+'_test_main.sqlite');
        //let auditSQLiteDB = `${MainPath}db${path.sep}restore${path.sep}test${path.sep}${zipFileNamePrefix}_test_audit.sqlite`; //Base de datos de auditoría de prueba
        let auditSQLiteDB = path.join(MainPath,'db','restore','test',zipFileNamePrefix+'_test_audit.sqlite');
        
        let sqliteExecutable: string;
        if (os.platform() === "linux") {
            sqliteExecutable = `sqlite-tools-linux-x86-3260000${path.sep}sqlite3`;
        } else if (os.platform() === "win32") {
            sqliteExecutable = `sqlite-tools-win32-x86-3260000${path.sep}sqlite3.exe`;
        } else {
            if (fs.existsSync(auditDbSQLFile)) {
                fs.unlinkSync(auditDbSQLFile);
            }
            if (fs.existsSync(mainDbSQLFile)) {
                fs.unlinkSync(mainDbSQLFile);
            }
            if (fs.existsSync(mainSQLiteDB)) {
                fs.unlinkSync(mainSQLiteDB);
            }
            if (fs.existsSync(auditSQLiteDB)) {
                fs.unlinkSync(auditSQLiteDB);
            }
            importResult.result = ImportResultCode.PLATFORM_NOT_SUPPORTED;
            return importResult;
        }

        const sqlitePath = `${`${MainPath}bin${path.sep}${sqliteExecutable}`}`;
        let mainDBDumpCommand = `"${sqlitePath}" "${mainSQLiteDB}" < "${mainDbSQLFile}"`;
        let auditDBDumpCommand = `"${sqlitePath}" "${auditSQLiteDB}" < "${auditDbSQLFile}"`;

        if (!fs.existsSync(filePath)) {
            if (fs.existsSync(auditDbSQLFile)) {
                fs.unlinkSync(auditDbSQLFile);
            }
            if (fs.existsSync(mainDbSQLFile)) {
                fs.unlinkSync(mainDbSQLFile);
            }
            if (fs.existsSync(mainSQLiteDB)) {
                fs.unlinkSync(mainSQLiteDB);
            }
            if (fs.existsSync(auditSQLiteDB)) {
                fs.unlinkSync(auditSQLiteDB);
            }
            importResult.result = ImportResultCode.ZIP_DOES_NOT_EXIST;
            return importResult;
        }

        try {
            let zipFile: JSZip;
            zipFile = await JSZip.loadAsync(fs.readFileSync(filePath));

            let mainDatabaseStream: NodeJS.ReadableStream;
            let auditDatabaseStream: NodeJS.ReadableStream;
            Object.keys(zipFile.files).forEach((fileName: string) => {
                if (/(audit)/g.test(fileName)) {
                    auditDatabaseStream = zipFile.file(fileName).nodeStream();
                }
                if (/(main)/g.test(fileName)) {
                    mainDatabaseStream = zipFile.file(fileName).nodeStream();
                }
            });
            await Promise.all([
                    new Promise((accept) => {
                        auditDatabaseStream.pipe(fs.createWriteStream(auditDbSQLFile))
                            .on('close', function () {
                                accept();
                            });
                    }),
                    new Promise((accept) => {
                        mainDatabaseStream.pipe(fs.createWriteStream(mainDbSQLFile))
                            .on('close', function () {
                                accept();
                            });
                    })
                ])
                .catch((e) => {
                    console.log(`
                
                ************************************************
                
                ERROR ON PROMISE: `, e, `
                
                ************************************************
                
                `);
                });
        } catch (e) {
            console.log(`
            
            doImport    Erro -   226 `, e, `
            
            `);
            importResult.result = ImportResultCode.ZIP_READING_ERROR;
            importResult.data = e;
            return importResult;
        }

        //2. Generate temporary databases.


        try {
            await Promise.all([child_process.execSync(mainDBDumpCommand), child_process.execSync(auditDBDumpCommand)]);
        } catch (e) {
            if (fs.existsSync(auditDbSQLFile)) {
                fs.unlinkSync(auditDbSQLFile);
            }
            if (fs.existsSync(mainDbSQLFile)) {
                fs.unlinkSync(mainDbSQLFile);
            }
            if (fs.existsSync(mainSQLiteDB)) {
                fs.unlinkSync(mainSQLiteDB);
            }
            if (fs.existsSync(auditSQLiteDB)) {
                fs.unlinkSync(auditSQLiteDB);
            }
            importResult.result = ImportResultCode.DB_TEST_RESTORE_ERROR;
            importResult.data = e;
            return importResult;
        }
        let mainExists = fs.existsSync(mainSQLiteDB);
        let auditExists = fs.existsSync(auditSQLiteDB);
        if (!(mainExists && auditExists)) {

            console.log(`
            
            doImport ERROR   -   256 -   Databases could NOT be created
            
            `);

            if (fs.existsSync(auditDbSQLFile)) {
                fs.unlinkSync(auditDbSQLFile);
            }
            if (fs.existsSync(mainDbSQLFile)) {
                fs.unlinkSync(mainDbSQLFile);
            }
            if (fs.existsSync(mainSQLiteDB)) {
                fs.unlinkSync(mainSQLiteDB);
            }
            if (fs.existsSync(auditSQLiteDB)) {
                fs.unlinkSync(auditSQLiteDB);
            }
            importResult.result = ImportResultCode.DB_TEST_CREATION_ERROR;
            return importResult;
        }

        //3. Revisamos la integridad de la base de datos con SQLite3 pragma integrity_check
        try {
            let pragma_check_command = `"${sqlitePath}" "${mainSQLiteDB}" "pragma integrity_check;"`
            let result: any = await new Promise((accept) => {
                child_process.exec(pragma_check_command, function (error, stdOut, stdErr) {
                    accept({
                        error: error,
                        stdOut: stdOut,
                        stdErr: stdErr
                    });
                });
            });
            console.log(`
            
            PRAGMA INTEGRITY CHECK (${pragma_check_command}) FOR MAIN DATABASE: ${result.stdOut}
            
            `);
            if (result.stdOut.indexOf("ok") != 0) {
                importResult.result = ImportResultCode.DB_TEST_INTEGRITY_CHECK_ERROR;
                importResult.data = result.stdOut;
                return importResult;
            }
            pragma_check_command = `"${sqlitePath}" "${auditSQLiteDB}" "pragma integrity_check;"`
            result = await new Promise((accept) => {
                child_process.exec(pragma_check_command, function (error, stdOut, stdErr) {
                    accept({
                        error: error,
                        stdOut: stdOut,
                        stdErr: stdErr
                    });
                });
            });
            console.log(`
            
            PRAGMA INTEGRITY CHECK (${pragma_check_command}) FOR AUDIT DATABASE: ${result.stdOut}
            
            `);
            if (result.stdOut.indexOf("ok") != 0) {
                console.log("Integrity check failed for audit database... ", result.stdOut);

                if (fs.existsSync(auditDbSQLFile)) {
                    fs.unlinkSync(auditDbSQLFile);
                }
                if (fs.existsSync(mainDbSQLFile)) {
                    fs.unlinkSync(mainDbSQLFile);
                }
                if (fs.existsSync(mainSQLiteDB)) {
                    fs.unlinkSync(mainSQLiteDB);
                }
                if (fs.existsSync(auditSQLiteDB)) {
                    fs.unlinkSync(auditSQLiteDB);
                }
                importResult.result = ImportResultCode.DB_TEST_INTEGRITY_CHECK_ERROR;
                importResult.data = result.stdOut;
                return importResult;
            }
        } catch (e) {
            console.log(`
            
            
            
            doImport - 331 - Error from pragma integrity check: `, e, `
            
            
            
            `);
            if (fs.existsSync(auditDbSQLFile)) {
                fs.unlinkSync(auditDbSQLFile);
            }
            if (fs.existsSync(mainDbSQLFile)) {
                fs.unlinkSync(mainDbSQLFile);
            }
            if (fs.existsSync(mainSQLiteDB)) {
                fs.unlinkSync(mainSQLiteDB);
            }
            if (fs.existsSync(auditSQLiteDB)) {
                fs.unlinkSync(auditSQLiteDB);
            }
            importResult.result = ImportResultCode.DB_TEST_INTEGRITY_CHECK_ERROR;
            importResult.data = e;
            return importResult;
        }

        //4. Test connection to temporary databases

        let mainConnection: Connection
        let auditConnection: Connection;
        try {
            mainConnection = await createConnection({
                type: "sqlite",
                name: 'TestSQLiteConnection_' + Math.floor(Math.random() * new Date().getTime()),
                synchronize: false,
                logging: true,
                logger: "simple-console",
                database: mainSQLiteDB,
                entities: [
                    User,
                    UserContact,
                    BaseRole,
                    Company,
                    Currency,
                    Doc,
                    Jwt,
                    Log,
                    LogActions,
                    Login,
                    Membership,
                    Payment,
                    Role
                ]
            });
            auditConnection = await createConnection({
                type: "sqlite",
                name: 'TestSQLiteAuditConnection_' + Math.floor(Math.random() * new Date().getTime()),
                synchronize: false,
                logging: true,
                logger: "simple-console",
                database: auditSQLiteDB,
                entities: [
                    LogContent
                ]
            });
        } catch (e) {
            if (fs.existsSync(auditDbSQLFile)) {
                fs.unlinkSync(auditDbSQLFile);
            }
            if (fs.existsSync(mainDbSQLFile)) {
                fs.unlinkSync(mainDbSQLFile);
            }
            if (fs.existsSync(mainSQLiteDB)) {
                fs.unlinkSync(mainSQLiteDB);
            }
            if (fs.existsSync(auditSQLiteDB)) {
                fs.unlinkSync(auditSQLiteDB);
            }
            importResult.result = ImportResultCode.DB_TEST_CONNECTION_ERROR;
            importResult.data = e;
            console.log(`
            
            
            doImport        -       ERROR ON DATA: e: `, e, `
            
            
            `);
            return importResult;
        }

        console.log(`
        

        ************************************************
        mainSQLiteDB: ${mainSQLiteDB}
        ************************************************
        
        
        `);

        try {

            let users = await mainConnection.getRepository(User).count();
            let baseRoles = await mainConnection.getRepository(BaseRole).count();
            let currencies = await mainConnection.getRepository(Currency).count();
            let company = await mainConnection.getRepository(Company).count();

            if (
                users < 1 ||
                baseRoles < 1 ||
                currencies < 1 ||
                company < 1
            ) {

                console.log(`
                
                
                ERROR CONTANDO LA CANTIDAD DE REGISTROS. REVISAR NUEVAMENTE...
                
                mainSQLiteDB: ${mainSQLiteDB}
                
                `);
            }
            await mainConnection.close();
            await auditConnection.close();
        } catch (e) {
            if (fs.existsSync(auditDbSQLFile)) {
                fs.unlinkSync(auditDbSQLFile);
            }
            if (fs.existsSync(mainDbSQLFile)) {
                fs.unlinkSync(mainDbSQLFile);
            }
            if (fs.existsSync(mainSQLiteDB)) {
                fs.unlinkSync(mainSQLiteDB);
            }
            if (fs.existsSync(auditSQLiteDB)) {
                fs.unlinkSync(auditSQLiteDB);
            }
            importResult.data = e;
            importResult.result = ImportResultCode.DB_TEST_FIELD_COUNT_ERROR;
            return importResult;
        }

        //5. Replace current databases with test databases.

        //5.1. Close the databases.
        if (DatabaseService.Instance) {
            if (DatabaseService.Instance.connection) {
                await DatabaseService.Instance.connection.close();
            }
            if (DatabaseService.Instance.auditConnection) {
                await DatabaseService.Instance.auditConnection.close();
            }
        }

        //5.2. Generate a backup file from the database.
        try{

            let backupResult = await ExportManager.Instance.doExport();
            if (backupResult.result != ExportResultCode.SUCCESS) {
                console.log(`
                
    
                
                doImport - 446 - Failed to generate backup file...`
    
    
                );
            }
        }catch(e){
            console.log(`
            
            doImport - 626: Failed to generate backup file...
            
            `);
        }

        //5.3. Replace files.
        try{
            let currentDatabase_audit:string = ((): string => {
                return DatabaseService.Instance.testing ?
                    DatabaseService.Instance._testingConfig.audit.connection.database :
                    DatabaseService.Instance._prodConfig.audit.connection.database
            })();
            let currentDatabase_main:string = ((): string => {
                return DatabaseService.Instance.testing ?
                    DatabaseService.Instance._testingConfig.primary.connection.database :
                    DatabaseService.Instance._prodConfig.primary.connection.database
            })();
            console.log(`
            
            Reemplazando archivos:

            ${currentDatabase_audit} POR -> ${auditSQLiteDB}

            ${currentDatabase_main} POR -> ${mainSQLiteDB}
            
            `);
            fs.writeFileSync(currentDatabase_audit, fs.readFileSync(auditSQLiteDB));
            fs.writeFileSync(currentDatabase_main, fs.readFileSync(mainSQLiteDB));
        }catch(e){
            console.log(`
            
            ***********************

            ERROR REPLACING FILES...

            ***********************
            
            `);
            console.log(e);
        }
        

        //5.4 Reconnect Database
        try {
            if(!DatabaseService.Instance._initialized){
                await DatabaseService.Instance.initialize();
            }else{
                await DatabaseService.Instance.connection.connect();
                await DatabaseService.Instance.auditConnection.connect();
            }
        } catch (e) {
            console.log("ERROR STARTING CONNECTION...");
            console.log(e);
        }

        ///*
        if (fs.existsSync(auditDbSQLFile)) {
            fs.unlinkSync(auditDbSQLFile);
        }
        if (fs.existsSync(mainDbSQLFile)) {
            fs.unlinkSync(mainDbSQLFile);
        }
        if (fs.existsSync(mainSQLiteDB)) {
            fs.unlinkSync(mainSQLiteDB);
        }
        if (fs.existsSync(auditSQLiteDB)) {
            fs.unlinkSync(auditSQLiteDB);
        }
        //*/
        return importResult;
    }

    /**
     * 
     * @description Generates the rutes of export for the files
     * @returns 
     *  - mainDBDumpCommand:    Main database dump command.
     *  - auditDBDumpCommand:   Audit database command dump.
     *  - dumpMainLocation:     The location for the main database dump.
     *  - dumpMainLocation:     The location for the audit database dump.
     *  - filePrefix:           Prefix for the file.
     *  - zipFileLocation:      Location for the zip file.
     */
    public getExportPaths(): {
        mainDBDumpCommand: string,
        auditDBDumpCommand: string,
        dumpMainLocation: string,
        dumpAuditLocation: string,
        filePrefix: string,
        zipFileLocation: string
    } {

        let sqliteExecutable: string; //Version de SQLite a ejecutar

        const mainSQLiteDB = DatabaseService.Instance.testing ?
            DatabaseService.Instance._testingConfig.primary.connection.database :
            DatabaseService.Instance._prodConfig.primary.connection.database; //Base de datos principal

        const auditSQLiteDB = DatabaseService.Instance.testing ?
            DatabaseService.Instance._testingConfig.audit.connection.database :
            DatabaseService.Instance._prodConfig.audit.connection.database; //Base de datos de auditoría

        let mainDBDumpCommand: string = ""; //Comando de dump de base de datos principal
        let auditDBDumpCommand: string = ""; //comando de dump de base de datos auditoría
        let filePrefix = moment().format("YYYY_M_D_HH_mm_ss_");
        //Crea carpetas (si no existen)
        if (!fs.existsSync(`${MainPath}db${path.sep}dump`)) {
            fs.mkdirSync(`${MainPath}db${path.sep}dump`);
        }

        let zipFileLocation = `${MainPath}db${path.sep}dump${path.sep}zip${path.sep}${filePrefix}dump.zip`
        if (!fs.existsSync(`${MainPath}db${path.sep}dump${path.sep}zip${path.sep}`)) {
            fs.mkdirSync(`${MainPath}db${path.sep}dump${path.sep}zip${path.sep}`);
        }

        //Locación de archivo de comandos de BD principal
        let mainDumpTextLocation: string = `${MainPath}db${path.sep}dump${path.sep}commands${path.sep}dump_main_commands.txt`;
        try {
            if (!fs.existsSync(`${MainPath}db${path.sep}dump${path.sep}commands`)) {
                fs.mkdirSync(`${MainPath}db${path.sep}dump${path.sep}commands`);
            }
            //const command:string = `.output '${MainFilePath}db${CommandFilePath}dump${CommandFilePath}sql${CommandFilePath}dump_main.sql'\n.dump\n.exit\n`;
            const command: string = `.output '${MainPath}db${path.sep}dump${path.sep}sql${path.sep}dump_main.sql'\n.dump\n.exit\n`;
            fs.writeFileSync(mainDumpTextLocation, command);
        } catch (e) {
            console.log(`
            
            
            ************************************************************************************
            
            Error writing MAIN dump file.
            
            ************************************************************************************
            
            `);
            console.log(e);
            throw e;
        }
        //Locación de archivo de comandos de BD auditoría
        let auditDumpTextLocation: string = `${MainPath}db${path.sep}dump${path.sep}commands${path.sep}dump_audit_commands.txt`;
        try {
            let command: string = `.output '${MainPath}db${path.sep}dump${path.sep}sql${path.sep}dump_audit.sql'\n.dump\n.exit`;
            fs.writeFileSync(auditDumpTextLocation, command);
        } catch (e) {
            console.log(`
            
            
            ************************************************************************************
            
            Error writing AUDIT dump file.
            
            ************************************************************************************
            
            `);
            console.log(e);
            throw e;
        }

        //Locación del archivo dump .sql de base de datos principal a producir
        let dumpMainLocation: string = `${MainPath}db${path.sep}dump${path.sep}sql${path.sep}dump_main.sql`
        if (!fs.existsSync(`${MainPath}db${path.sep}dump${path.sep}sql${path.sep}`)) {
            try {
                fs.mkdirSync(`${MainPath}db${path.sep}dump${path.sep}sql${path.sep}`);
            } catch (e) {
                console.log(`
                
                ************************************************************************************
                
                Error generating SQL dump directory: `, e, `

                ************************************************************************************
                
                `);
            }

        }

        //Locación del archivo dump .sql de base de datos de auditoría a producir
        let dumpAuditLocation: string = `${MainPath}db${path.sep}dump${path.sep}sql${path.sep}dump_audit.sql`

        if (os.platform() === "linux") {
            sqliteExecutable = `sqlite-tools-linux-x86-3260000${path.sep}sqlite3`;
            mainDBDumpCommand = `"${`${MainPath}bin${path.sep}${sqliteExecutable}`}" "${mainSQLiteDB}" < "${mainDumpTextLocation}"`;
            auditDBDumpCommand = `"${`${MainPath}bin${path.sep}${sqliteExecutable}`}" "${auditSQLiteDB}" < "${auditDumpTextLocation}"`;
        } else if (os.platform() === "win32") {
            sqliteExecutable = `sqlite-tools-win32-x86-3260000${path.sep}sqlite3.exe`;
            mainDBDumpCommand = `"${`${MainPath}bin${path.sep}${sqliteExecutable}`}" "${mainSQLiteDB}" < "${mainDumpTextLocation}"`;
            auditDBDumpCommand = `"${`${MainPath}bin${path.sep}${sqliteExecutable}`}" "${auditSQLiteDB}" < "${auditDumpTextLocation}"`;
        }

        return {
            mainDBDumpCommand: mainDBDumpCommand,
            auditDBDumpCommand: auditDBDumpCommand,
            dumpMainLocation: dumpMainLocation,
            dumpAuditLocation: dumpAuditLocation,
            filePrefix: filePrefix,
            zipFileLocation: zipFileLocation
        }
    }

    public async dumpDoesExist(fileName: string) {
        let zipFileLocation = this.getDumpLocation(fileName);
        let result = await fs.existsSync(zipFileLocation);
        return result;
    }

    public getDumpLocation(fileName ? : string) {
        if (fileName) {
            return path.join(MainPath, 'db', 'dump', 'zip', fileName);
        } else {
            return path.join(MainPath, 'db', 'dump', 'zip');
        }
    }

    public getRestoreLocation(fileName ? : string) {
        const mainFolder = this.getDumpLocation();
        //`${MainPath}db${path.sep}restore${path.sep}zip`;
        if (!fs.existsSync(mainFolder)) {
            fs.mkdirSync(mainFolder);
        }
        if (fileName) {
            return `${mainFolder}${path.sep}${fileName}`;
        } else {
            return `${mainFolder}${path.sep}`;
        }
    }


    public async getDumpList(): Promise < string[] > {
        let mainDumpLocation = this.getDumpLocation();
        if(!fs.existsSync(mainDumpLocation)){
            fs.mkdirSync(mainDumpLocation);
        }
        let fileList = await new Promise < string[] > ((accept) => {
            fs.readdir(mainDumpLocation, function (err, files) {
                if (err) {
                    //console.log("ERROR 790: READING DIRECTORY...");
                    //console.log(err);
                    accept([]);
                }
                accept(files);
            });
        });
        return fileList;
    }

    public async removeDumpFile(fileName: string): Promise < boolean > {
        let dumpFolder = this.getDumpLocation();
        let filePath = path.join(dumpFolder, fileName);
        if (fs.existsSync(filePath)) {
            console.log(`
            File exists...
            `);
            try {
                fs.unlinkSync(filePath);
                return true;
            } catch (e) {
                console.log(`
                Error deleting file: `, e);
            }
        } else {
            console.log(`
            
            File doesn't exist.

            Folder: ${dumpFolder}
            File path: ${filePath}
            Path: ${filePath}
            `);
            return false;
        }

    }

    /**
     * @description Makes the export of the main database and
     * audit database to a .ZIP file
     * @returns Returns the path for such file.
     */
    public async doExport(): Promise < IExportResult > {
        //Obtenemos las rutas de exportación
        let paths = this.getExportPaths();


        console.log(`
        
        
        paths: `, paths, `
        
        
        
        `);
        console.log(`exportManager - 848`);
        let dumpCommandsResult;
        try {
            try{
                dumpCommandsResult = await Promise.all([child_process.execSync(paths.mainDBDumpCommand), child_process.execSync(paths.auditDBDumpCommand)]);
            }catch(e){
                console.log(`
                        
                ****************************************************************************************
                
                Error - 898
                
                ****************************************************************************************

                `);
                return {
                    result: ExportResultCode.ERROR_GENERATING_ZIP,
                    data: "FILE_NOT_FOUND",
                    outputFileLocation: null
                }
            }
            
            console.log(`exportManager - 852`);
            let mainExists = fs.existsSync(paths.dumpMainLocation);
            let auditExists = fs.existsSync(paths.dumpAuditLocation);
            if (mainExists && auditExists) {
                let oldName_main: string = paths.dumpMainLocation.split(path.sep).splice(-1)[0];
                let newName_main = paths.filePrefix + oldName_main;
                let newLocation_main = paths.dumpMainLocation.replace(oldName_main, newName_main);
                console.log(`exportManager - 859`);

                let oldName_audit: string = paths.dumpAuditLocation.split(path.sep).splice(-1)[0];
                let newName_audit = paths.filePrefix + oldName_audit;
                let newLocation_audit = paths.dumpAuditLocation.replace(oldName_audit, newName_audit);
                console.log(`exportManager - 864`);
                try {
                    fs.renameSync(paths.dumpMainLocation, newLocation_main);
                    fs.renameSync(paths.dumpAuditLocation, newLocation_audit);

                    let mainFilContent = fs.readFileSync(newLocation_main)
                    let auditFileeContent = fs.readFileSync(newLocation_audit)
                    //Locación del archivo a generar                    

                    //Comprimir archivos en uno sólo
                    console.log(`exportManager - 874`);
                    var zip = new JSZip();
                    zip.file(newLocation_main.split(path.sep).slice(-1)[0], mainFilContent, {
                        createFolders: false
                    });
                    zip.file(newLocation_audit.split(path.sep).slice(-1)[0], auditFileeContent, {
                        createFolders: false
                    });
                    console.log(`exportManager - 882`);
                    let generated: any = await new Promise((accept, reject) => {
                        zip
                            .generateNodeStream({
                                type: 'nodebuffer',
                                streamFiles: true
                            })
                            .pipe(fs.createWriteStream(paths.zipFileLocation))
                            .on('finish', () => {
                                console.log(`exportManager - 891`);
                                accept({
                                    finished: true
                                });
                            })
                            .on('error', (e) => {
                                console.log(`exportManager - 897
                                
                                `, e);
                                console.log(`
                            
                            ****************************************************************************************
                            
                            Error - 620: `, e, `
                            
                            ****************************************************************************************
        
                            `);
                                accept({
                                    finished: false,
                                    error: e
                                });
                            });
                    });
                    if (generated.finished) {
                        console.log(`exportManager - 916`, generated);
                        fs.unlinkSync(newLocation_main);
                        fs.unlinkSync(newLocation_audit);
                        console.log(`
                        
                        ************************************************************************
                        915: EXPORT GENERATED
                        ************************************************************************
                        
                        `);
                        return {
                            result: ExportResultCode.SUCCESS,
                            data: null,
                            outputFileLocation: paths.zipFileLocation
                        }
                    } else {
                        console.log(`
                        
                        ****************************************************************************************
                        
                        Error - 631
                        
                        ****************************************************************************************
    
                        `);
                        fs.unlinkSync(newLocation_main);
                        fs.unlinkSync(newLocation_audit);
                        return {
                            result: ExportResultCode.ERROR_GENERATING_ZIP,
                            data: generated.error,
                            outputFileLocation: null
                        }
                    }
                } catch (e) {
                    console.log(`
                    
                    ****************************************************************************************

                    Error - 640: `, e, `
                    
                    ****************************************************************************************

                    `);
                    console.log(e);
                    fs.unlinkSync(paths.dumpMainLocation);
                    fs.unlinkSync(paths.dumpAuditLocation);
                    return {
                        result: ExportResultCode.ERROR_RENAMING_FILES,
                        data: null,
                        outputFileLocation: null
                    }
                }
            } else {
                console.log(`
                
                ****************************************************************************************
                
                Files not generated

                ****************************************************************************************
                
                `);
                return {
                    result: ExportResultCode.FILES_NOT_GENERATED,
                    data: null,
                    outputFileLocation: null
                }
            }
        } catch (e) {
            console.log(`

            ****************************************************************************************
            
            Error 658:
            
            `, e, `
            
            ****************************************************************************************

            `);
            return {
                result: ExportResultCode.ERROR_GENERATING_FILES,
                data: e,
                outputFileLocation: dumpCommandsResult
            }
        }
    }

    //Lee los registros de un archivo y devuelve los elementos como objetos de datos
    public async parseRecords(filePath: string, encoding ? : string): Promise < RecordParseDataObject[] > {
        //Definimos los parámetros del lector
        const parser = new Parser({
            delimiter: ',',
            quote: "\"",
            relax_column_count: true,
            skip_lines_with_error: true,
            skip_empty_lines: true,
            columns: [ //ParseRecordData
                'ci',
                'phone',
                'name',
                'surName',
                'ammount',
                'address',
                'inscription_day',
                'inscription_month',
                'inscription_year',
                'due_date_day',
                'due_date_month',
                'due_date_year',
                "odd_separator"
            ]
        });
        const output: RecordParseDataObject[] = [];
        
        //Una vez el lector empieza a leer un archivo, esta funcion se activa.
        parser.on('readable', function () {
            let record: IParseRecordData;
            while (record = parser.read()) {
                let dataObject = new RecordParseDataObject();
                dataObject.setFromRecord(record);
                if (SyntaxValidationProvider.validateDocumentContent[DOCUMENT_PREFIXES.CI](
                        SyntaxValidationProvider.normalizeDocumentContentFunctions_clean[DOCUMENT_PREFIXES.CI](dataObject.ci)
                    )) {
                    output.push(dataObject);
                } else {
                    console.log("CÉDULA INVÁLIDA: ", dataObject.ci);
                }
            }
        });


        //Esperamos a que termine de leer los archivos.
        await new Promise((accept) => {
            let readStream: fs.ReadStream;
            if (encoding) {
                encoding = encodingExists(encoding) ? encoding : 'ISO-8859-14';
                if (encodingExists(encoding)) {
                    var output = decode(fs.readFileSync(filePath), encoding);
                    const Readable = require('stream').Readable;
                    const s = new Readable();
                    s._read = () => {}; // redundant? see update below
                    s.push(output);
                    s.push(null);
                    readStream = s;
                } else {
                    fs.createReadStream(filePath)
                }
            } else {
                fs.createReadStream(filePath)
            }

            readStream.pipe(parser);
            parser.on('error', function (err) {
                console.log(`
                
                **********************************************************************            
                error 192: PARSER ERROR `, err, `
                **********************************************************************
                
                `);
                accept([]);
            })
            //Termina de leer un archivo
            parser.on('end', function () {
                accept(output);
            });
        });
        return output;
    }

    /**
     * 
     * @param records Record data so log
     * @description Stores the parsed instance records from the .txt files into the database.
     */
    public async saveInstanceRecords(records: RecordParseDataObject[], log_level:ExportOperationLoggingLevel) {
        if (records.length > 0) {
            if (!DatabaseService.Instance.connection) {
                await SocketServer.Instance.init();
            }
        }
        let savedRecords = 0;
        let clientBaseRole = await BaseRole.getClientBaseRole();
        let defaultCompany: Company = await Company.getBaseCompany();
        const userRepository = DatabaseService.Instance.connection.getRepository(User);

        let log = log_level ? log_level : {
            a: 1,
            b: 0,
            c: 0
        };
        for (let i = 0; i < records.length; i++) {
            if (log.c)
                console.log(`
            
                records[i]: ${JSON.stringify(records[i])}
                
                `);
            if(Object.keys(JSON.parse(JSON.stringify(records[i]))).length<10){
                continue;
            }
            let parsedUser: User = await records[i].toDatabaseRecord();
            try {
                let normalizedDocumentContent = SyntaxValidationProvider.normalizeDocumentContentFunctions[parsedUser.document.prefix](parsedUser.document.content);
                let existingUserCount = await userRepository.createQueryBuilder("user")
                    .leftJoinAndSelect("user.document", "userDocument")
                    .where("userDocument.prefix = :prefix", {
                        prefix: parsedUser.document.prefix
                    })
                    .andWhere("userDocument.content = :content", {
                        content: normalizedDocumentContent
                    }).getCount();
                if (existingUserCount > 0) {
                    let existingUser = await User.getByDocument(
                        parsedUser.document.prefix,
                        SyntaxValidationProvider.normalizeDocumentContentFunctions[parsedUser.document.prefix](parsedUser.document.content), ['membership']);
                    if (records[i].hasSameCutDate(existingUser.membership.cutDate) &&
                        parsedUser.membership.monthAmmount == existingUser.membership.monthAmmount) {
                        continue;
                    }
                    let update: boolean = false;
                    if (

                        ( //The record inscription date is valid but the DB one isn't
                            moment(records[i].getInscriptionDate()).isValid() &&
                            !moment(existingUser.membership.createdAt).isValid()
                        ) ||
                        ( 
                            //The inscription date from the record is greater than the stored one
                            moment(records[i].getInscriptionDate()).isValid() &&
                            moment(records[i].getInscriptionDate())
                            .isAfter(existingUser.membership.createdAt)
                        )
                    ) {
                        existingUser.membership.createdAt = records[i].getInscriptionDate();
                        update = true;
                    }
                    if (
                        moment(records[i].getCutDate())
                        .isAfter(existingUser.membership.cutDate) ||
                        ( 
                            //The stored date isn't valid, but the one on the cut date is.
                            !moment(existingUser.membership.cutDate).isValid()
                        )
                    ) {

                        if (moment(records[i].getCutDate()).isValid()) {
                            if (log.a)
                                console.log(`
                            ****************************
                            DB Date: ${existingUser.membership.cutDate}
                            Valid date from the .txt record: ${records[i].getCutDate()}
                            moment(records[i].getCutDate()).isAfter(existingUser.membership.cutDate): ${moment(records[i].getCutDate()).isAfter(existingUser.membership.cutDate)}
                            !moment(existingUser.membership.cutDate).isValid()): ${!moment(existingUser.membership.cutDate).isValid()}
                            Quantity of the .txt record: ${parsedUser.membership.monthAmmount}
                            Quantity of the database record: ${existingUser.membership.monthAmmount}
                            //
                            records[i]: ${JSON.stringify(records[i])}
                            existingUser.membership: ${JSON.stringify(existingUser.membership.toJson())}
                            ****************************
                            `);
                            if (!moment(existingUser.membership.cutDate).isValid()) {

                                if (log.a)
                                    console.log(`
                                ****************************
                                Invalid date (On the database): ${existingUser.membership.cutDate}
                                ****************************                                
                                `);
                            }
                            existingUser.membership.cutDate = records[i].getCutDate();
                            update = true;
                        } else {

                            if (log.a)
                                console.log(`
                            ****************************
                            INVALID DATE on the .txt record: ${records[i].due_date_year}/${records[i].due_date_month}/${records[i].due_date_day}
                            Database Date: ${existingUser.membership.cutDate}
                            Valid date from the database? ${moment(existingUser.membership.cutDate).isValid()}
                            records[i]: ${JSON.stringify(records[i])}
                            ****************************                                
                            `);

                            if (!moment(existingUser.membership.cutDate).isValid()) {
                                ///*
                                let newCutDate = moment()
                                    .set('year', 1981)
                                    .month(0)
                                    .day(1)
                                    .toDate();

                                if (log.a)
                                    console.log(`
                                
                                NORMALIZING DATABASE DATE TO: ${newCutDate}
                                
                                `);
                                existingUser.membership.cutDate = newCutDate;
                                //*/
                            }
                        }
                    }
                    if (parsedUser.membership.monthAmmount != existingUser.membership.monthAmmount) {
                        if (
                            moment(records[i].getCutDate()).isAfter(existingUser.membership.cutDate) ||
                            (
                                moment(records[i].getCutDate()).isSame(existingUser.membership.cutDate) &&
                                (existingUser.membership.monthAmmount < parsedUser.membership.monthAmmount)
                            )
                        ) {
                            if (log.a)
                                console.log(`
                            
                            ***********************************
                            UPDATING MOTHLY AMMOUNT
                            User:        ${existingUser.firstName}
                            DB Date:       ${existingUser.membership.cutDate} // Fecha parseada: ${records[i].getCutDate()}
                            DB Ammount:       ${existingUser.membership.monthAmmount}
                            Parsed Ammount:   ${parsedUser.membership.monthAmmount}
                            ${existingUser.membership.monthAmmount} -> ${parsedUser.membership.monthAmmount}


                            moment(records[i].getCutDate()).isBefore(existingUser.membership.cutDate): ${moment(records[i].getCutDate()).isBefore(existingUser.membership.cutDate)}
                            moment(records[i].getCutDate()).isSame(existingUser.membership.cutDate): ${moment(records[i].getCutDate()).isSame(existingUser.membership.cutDate)}
                            (existingUser.membership.monthAmmount < parsedUser.membership.monthAmmount): ${(existingUser.membership.monthAmmount < parsedUser.membership.monthAmmount)}
                            ***********************************
                            
                            `);
                            existingUser.membership.monthAmmount = parsedUser.membership.monthAmmount;
                            update = true;
                        }
                    }
                    if (update) {
                        await DatabaseService.Instance.connection.getRepository(Membership).save(existingUser.membership);
                    }
                } else {
                    if (log.b)
                        console.log(`

                    ******************************
                    User has not been added to the database. Adding... `, JSON.stringify(parsedUser), `
                    ******************************
                    
                    `);
                    let userDoc: Doc = parsedUser.document;
                    let userMembership: Membership = parsedUser.membership;
                    parsedUser = (() => {
                        parsedUser.membership = null;
                        parsedUser.document = null;
                        return parsedUser;
                    })();

                    //Membership

                    userMembership.company = defaultCompany;

                    //Colocando la fecha por defecto de la membresía
                    if (!moment(userMembership.cutDate).isValid()) {
                        if (log.b)
                            console.log(`

                        ************************************
                        SETTING THE DEFAULT DATE ON THE DATABASE:
                        January 1, 1981
                        Name:         ${parsedUser.firstName}
                        Document:      ${userDoc.content}
                        ************************************
                        
                        `);
                        userMembership.cutDate = moment().set("year", 1981)
                            .set("month", 0)
                            .set('day', 1)
                            .set('hour', 0)
                            .set('second', 0)
                            .toDate();
                    }
                    if (!moment(userMembership.inscriptionDate).isValid()) {
                        if (log.b)
                            console.log(`

                        ************************************
                        SETTING THE DEFAULT RECORD DATE ON THE RECORD:
                        FEBRUARY 1, 1981
                        Nombre:         ${parsedUser.firstName}
                        Documento:      ${userDoc.content}
                        ************************************
                        
                        `);
                        userMembership.inscriptionDate = moment().set("year", 1981)
                            .set("month", 1)
                            .set('day', 1)
                            .set('hour', 0)
                            .set('second', 0)
                            .toDate();
                    }

                    //Role
                    let userRole = new Role();

                    userRole.baseRole = clientBaseRole;
                    userRole.status = RoleStatus.ACTIVE;
                    userRole.copyBaseRole(userRole.baseRole);

                    await getManager(DatabaseService.Instance.currentConfig.primary.connection.name)
                        .transaction(async transactionalEntityManager => {
                            userMembership.user = parsedUser;
                            userRole.user = parsedUser;
                            userDoc.user = parsedUser;

                            parsedUser = await transactionalEntityManager.save(parsedUser);
                            userMembership = await transactionalEntityManager.save(userMembership);
                            userRole = await transactionalEntityManager.save(userRole);
                            userDoc = await transactionalEntityManager.save(userDoc);
                        });


                    parsedUser.document = < any > userDoc.id;
                    parsedUser.membership = < any > userMembership.id;
                    parsedUser.role = < any > userRole.id;

                    parsedUser = await userRepository.save(parsedUser);
                    savedRecords++;
                }
            } catch (e) {
                console.log(`
                    ******************************
                    ERROR #204   -   `, e, `
                    ******************************
                `);
            }
        }
        return savedRecords;
    }

    /**
     * @description Imports a directory that contains .txt files from the old database into the current one,
     * generating a previous dump.
     * @param directory Parameter that indicates where is the directory.
     */
    async importFolder(directory: string, logging: ExportOperationLoggingLevel): Promise < ImportFolderResult > {
        let folderPath = directory;
        let result: ImportFolderResult = {
            files: 0,
            records: 0
        }
        //let folderPath = '/home/azolot/Downloads/test_node/data_gym';
        if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
            console.log(`

                *********************************
                ERROR 1170: NOT A DIRECTORY: ${folderPath}
                *********************************

                `);
            return;
        }
        let fileNameList = fs.readdirSync(folderPath);
        await this.doExport(); //
        for (let i = 0; i < fileNameList.length; i++) {
            let filePath = path.join(folderPath, fileNameList[i]);
            try {
                let fileCoding:string = chardet.detectFileSync(filePath);
                let records: RecordParseDataObject[] = await ExportManager.Instance.parseRecords(filePath, fileCoding || 'ISO-8859-14');
                    //'ISO-8859-14');
                console.log(`
                    *****************************
                    We got ${records.length} records from file ${filePath}
                    Storing...
                    *****************************
                    `);
                let recordsSaved = await ExportManager.Instance.saveInstanceRecords(records, logging);
                result.files++;
                result.records += recordsSaved;
            } catch (e) {
                console.log(`
                    Error on records: `, e, `
                    `);
            }
        }
        //We normalize dates
        let nullInscriptionDates = await DatabaseService.Instance.connection.getRepository(Membership)
        .query(`SELECT ${TableNames.Membership.id} FROM ${TableNames.Membership.table_name} AS MEM WHERE DATE(MEM.${TableNames.Membership.inscription_date}) IS NULL`);
        for(let i=0;i<nullInscriptionDates.length;i++){
            let record:{membresia:number} = nullInscriptionDates[i];
            let recordA = await DatabaseService.Instance.connection.getRepository(Membership)
            .findOne(record.membresia);
            recordA.inscriptionDate = moment("1980/01/01 00:00:00", "YYYY/MM/DD HH:mm:ss").toDate();
            await DatabaseService.Instance.connection.getRepository(Membership).save(recordA);
        }
        let nullCutDateRecords = await DatabaseService.Instance.connection.getRepository(Membership)
        .query(`SELECT ${TableNames.Membership.id} FROM ${TableNames.Membership.table_name} AS MEM WHERE DATE(MEM.${TableNames.Membership.cut_date}) IS NULL`);
        for(let i=0;i<nullCutDateRecords.length;i++){
            let record:{membresia:number} = nullCutDateRecords[i];
            let recordA = await DatabaseService.Instance.connection.getRepository(Membership)
            .findOne(record.membresia);
            recordA.cutDate = moment("1980/02/01 00:00:00", "YYYY/MM/DD HH:mm:ss").toDate();
            await DatabaseService.Instance.connection.getRepository(Membership).save(recordA);
        }
        return result;
    }
}

/**
 * @description Parsed record data class.
 */
export class RecordParseDataObject implements IParseRecordData {
    ci: string;
    phone: string;
    name: string;
    surName: string;
    ammount: string;
    address: string;
    inscription_day: string;
    inscription_month: string;
    inscription_year: string;
    due_date_day: string;
    due_date_month: string;
    due_date_year: string;
    public static default_currency: Currency;

    public static readonly MONTH_MAPPING = [
        "ENE",
        "FEB",
        "MAR",
        "ABR",
        "MAY",
        "JUN",
        "JUL",
        "AGO",
        "SEP",
        "OCT",
        "NOV",
        "DIC",
    ]

    public static currencies: Currency[];

    constructor() {}

    setFromRecord(record: IParseRecordData) {
        this.ci = record.ci.trim();
        this.phone = record.phone;
        this.name = record.name ? record.name.trim() : record.name;
        this.surName = record.surName ? record.surName.trim() : record.surName;
        this.ammount = record.ammount ? record.ammount.trim() : record.ammount;
        this.address = record.address;
        this.inscription_day = record.inscription_day ? record.inscription_day.trim() : record.inscription_day;
        this.inscription_month = record.inscription_month ? record.inscription_month.trim() : record.inscription_month;
        this.inscription_year = record.inscription_year ? record.inscription_year.trim() : record.inscription_year;
        this.due_date_day = record.due_date_day ? record.due_date_day.trim() : record.due_date_day;
        this.due_date_month = record.due_date_month ? record.due_date_month.trim() : record.due_date_month;
        this.due_date_year = record.due_date_year ? record.due_date_year.trim() : record.due_date_year;
    }

    compareDates(date1: Date, date2: Date) {
        if (moment(date1).isAfter(date2)) {
            return 1;
        } else if (moment(date1).isBefore(date2)) {
            return 2;
        } else {
            if (
                date1.getFullYear() == date2.getFullYear() &&
                date1.getMonth() == date2.getMonth() &&
                date1.getDay() == date2.getDay()) {
                return 3;
            }
        }
    }

    getInscriptionDate() {
        let momentB = moment().year(
                parseInt(this.inscription_year)
            ).month(
                RecordParseDataObject.MONTH_MAPPING.indexOf(this.inscription_month)
            ).set('day', parseInt(this.inscription_day))
            .hour(0)
            .hour(0)
            .minute(0)
            .second(0)
            .millisecond(0);
        return momentB.toDate();
    }

    getCutDate() {
        let momentB = moment().year(
                parseInt(this.due_date_year)
            ).month(
                RecordParseDataObject.MONTH_MAPPING.indexOf(this.due_date_month) > -1 ?
                RecordParseDataObject.MONTH_MAPPING.indexOf(this.due_date_month) :
                (parseInt(this.due_date_month) - 1)
            ).set('day', parseInt(this.due_date_day))
            .hour(0)
            .minute(0)
            .second(0)
            .millisecond(0);
        return momentB.toDate();
    }

    async toDatabaseRecord() {
        const user: User = new User();
        user.status = ClientStatus.ACTIVE;
        user.document = new Doc();
        user.document.status = DocumentStatus.ACTIVE;
        user.membership = new Membership();
        user.membership.status = MembershipStatus.ACTIVE;

        user.document.content = SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this.ci);
        user.document.prefix = DOCUMENT_PREFIXES.CI;

        user.phone = this.phone;
        user.surName = this.surName;
        user.firstName = this.name;
        user.address = this.address;

        user.membership.inscriptionDate = this.getInscriptionDate();

        user.membership.cutDate = this.getCutDate();
        user.membership.monthAmmount = < number > SyntaxValidationProvider.Instance.ammountToInteger((() => {
            let ammountA = this.ammount.split(",")[0];
            let ammountB = this.ammount.split(",")[1];
            let ammountC = ammountA.replace(/[\.]/g, ',');
            if (ammountB) {
                ammountC = [ammountC, ammountB].join(".");
            }
            return ammountC;
        })(), 2);

        let payment: Payment = new Payment();


        payment.ammount = < number > SyntaxValidationProvider.Instance.ammountToInteger((() => {
            let ammountA = this.ammount.split(",")[0];
            let ammountB = this.ammount.split(",")[1];
            let ammountC = ammountA.replace(/[\.]/g, ',');
            if (ammountB) {
                ammountC = [ammountC, ammountB].join(".");
            }
            return ammountC;
        })(), 2);
        payment.status = PaymentStatus.ACTIVE;
        payment.paymentMethod = PAYMENT_METHODS.CASH;
        if ((RecordParseDataObject.currencies === undefined) || RecordParseDataObject.currencies.length < 1) {
            RecordParseDataObject.currencies = await Currency.getCurrencies();
        }
        payment.currency = RecordParseDataObject.currencies.find((currency: Currency) => {
            if (/^VE.$/.test(currency.id)) {
                RecordParseDataObject.default_currency = currency;
                return true;
            }
            return false;
        });

        //user.membership.payments = [];
        //user.membership.payments.push(payment);

        //user.membership.inscriptionDate = moment().format();
        return user;
    }

    public hasSameCutDate(outerDate: Date) {
        if (!moment(outerDate).isValid() ||
            !moment(this.getCutDate()).isValid()) {
            return false;
        }
        return (
            this.getCutDate().getFullYear() == outerDate.getFullYear() &&
            this.getCutDate().getMonth() == outerDate.getMonth() &&
            this.getCutDate().getDay() == outerDate.getDay()
        );
    }

}