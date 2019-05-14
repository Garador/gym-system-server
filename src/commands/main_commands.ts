import {
    command,
    description,
    option,
    program,
    requiredArg,
    usage,
    version,
    Command,
    optionalArg
} from 'commander-ts';
import {
    ExportManager
} from '../providers/ExportManager';
import * as fs from 'fs';
import * as path from 'path';
import {
    ImportResultCode
} from '../enums/ExportManager';
import { DatabaseService } from '../providers/databaseAdmin';
import { BaseTableProvider } from '../providers/BaseTableProvider';
import { ExportOperationLoggingLevel } from '../interfaces/ExportManager';

@program()
@version('1.0.0')
@description(`


***************************************************************
Commands that backup and restore the database
***************************************************************
COMANDO:        export
DESCRIPTION:    Generates a dump .zip file type for the database
PARAMETERS:
    $LOCATION   Directory where the dump file will be stored. For example: C:\\BACKUPS
USE:
    node src/index.js export $LOCATION

***************************************************************
COMANDO:        restore
DESCRIPTION:    Restores the database from a dump .zip filetype
PARAMETERS:
    $LOCATION   Location for the dump .zip file. Por ejemplo: C:\\BACKUPS\\2018_12_22_24_dump.zip
USE:
    node src/index.js restore $LOCATION
***************************************************************



***************************************************************
Commands that read the .txt records and store them into the database
***************************************************************

COMANDO:        parse
DESCRIPTION:    Add record reads from files to the database. 
                The old database is stored as a dump file right before the parsing starts.
PARAMETERS:
    Obligatorios:
        $LOCATION   Location where the data will be stored. For example: C:\\DATA
    Opcionales:
        $LOG    Group of three digits that will denote the log level wanted to display
                the import operation of the records. It will be denoted by 3 consecutive digits
                that can only be 1 or 0:
                First digit [(1)00]: Will generate a log for the new records.
                Second digit [0(1)0]: Will generate a log for the update of existing records.
                Thirds digit [00(1)]: Will generate a basic log of the obtained record
        
        Example:
                node src/index.js parse C:\\DATA\\ 001
                node src/index.js parse C:\\DATA\\ 011
                node src/index.js parse C:\\DATA\\ 111
USE:
    node src/index.js parse $LOCATION $LOG
***************************************************************

`)
@usage('--help')
export class Program {
    @option('--env <env>')
    env: string = null;

    constructor() {}

    run(@requiredArg('message') message) {
        console.log(`Message: ${message}`);
    }

    @command()
    async export (
        this: Command,
        @requiredArg('path') exportDirectory: string //Zip file to restore.
    ) {
        console.log(`Backing up to path: ${exportDirectory}`);

        if (fs.existsSync(exportDirectory) && fs.statSync(exportDirectory).isDirectory()) {
            let exportResult = await ExportManager.Instance.doExport();
            let dumpLocation = exportResult.outputFileLocation;
            let fileName: string = exportResult.outputFileLocation.split(path.sep).splice(-1)[0];
            let resultPath = path.join(exportDirectory, fileName);
            try {
                fs.copyFileSync(dumpLocation, resultPath);
                fs.unlinkSync(dumpLocation);
                console.log(`
                
                **************************************************

                ARCHIVO ${fileName} RESPALDADO A: ${resultPath}

                **************************************************
                
                `);
            } catch (e) {
                console.log(`

                **************************************************

                ERROR 80: `, e, `

                **************************************************
                
                `);
            }
        } else {
            console.log(`
            
            ************************************************
            ERROR 92: Directorio de respaldo "${exportDirectory}" no existe.
            ************************************************
            
            `);
        }
    }

    @command()
    async restore(
        this: Command,
        @requiredArg('path') filePath //Directory to store the dump to.
    ) {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            console.log(`Restoring up to path: ${filePath}`);

            //Generate dump file.
            //Store to provided path.
            try {
                await DatabaseService.Instance.initialize();
                let result = await ExportManager.Instance.doImport(filePath)
                if (result.result === ImportResultCode.SUCCESS) {
                    console.log(`
                    
                    ******************************************************
                    ZIP IMPORTADO EXITOSAMENTE.
                    ******************************************************
                    
                    `);
                } else {
                    console.log(`
                    
                    ******************************************************
                    ERROR IMPORTANDO DUMP.

                    CÓDIGO: ${result.result}
                    ******************************************************
                    
                    `);
                }
                // /home/azolot/Downloads/test_node/export1/2019_1_6_12_46_24_dump.zip
            } catch (e) {
                console.log(e);
            }
        } else {
            console.log(`
            
            
            ERROR 133: EL ARCHIVO "${filePath}" NO EXISTE O ES UN DIRECTORIO.
            
            
            `);
        }
    }

    @command()
    async parse(
        this: Command,
        @requiredArg('path') directoryPath //Path with .txt files.,
        ,@optionalArg('loggingLevel') loggingLevel
    ) {
        console.log(`
        
        ************************************
        IMPORTING TEXT FILES FROM: ${directoryPath}
        ************************************

        `);
        let logging:ExportOperationLoggingLevel = {};
        if(loggingLevel){
            let logginA = loggingLevel.split("");
            if(parseInt(logginA)[0] == 1 || parseInt(logginA)[0] == 0){
                logging.a = parseInt(logginA)[0];
            }
            if(parseInt(logginA)[1] == 1 || parseInt(logginA)[1] == 0){
                logging.b = parseInt(logginA)[1];
            }
            if(parseInt(logginA)[2] == 1 || parseInt(logginA)[2] == 0){
                logging.b = parseInt(logginA)[2];
            }
        }
        let startTimeStamp = new Date().getTime();
        await DatabaseService.Instance.initialize();
        await BaseTableProvider.Instance.initialize();
        let importResult = await ExportManager.Instance.importFolder(directoryPath,logging);
        let endTimestamp = new Date().getTime();


        console.log(`
        
        ************************************        
        IMPORT OPERATION FINISHED MADE.

        Beginning:      ${new Date(startTimeStamp)}
        End:            ${new Date(endTimestamp)}
        Time:           ${Math.floor((endTimestamp-startTimeStamp)/1000)} segundos.
        Records:        ${importResult.records}
        Files:          ${importResult.files}
        ************************************
        
        `);
    }
}