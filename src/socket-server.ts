import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import {User} from './models/User';
import {SocketServerHandler} from './providers/SocketServerHadler';
import {DatabaseService} from './providers/databaseAdmin';
import { CONNECTION_PARAMETERS } from './enums/Socket';
import { BaseTableProvider } from './providers/BaseTableProvider';
import { ExportManager } from './providers/ExportManager';

export class SocketServer {
    private static _instance:SocketServer;
    public static readonly PORT:number = CONNECTION_PARAMETERS.PORT;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;

    constructor() {
    }

    public async init(testing?:boolean){
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
        await this.createDatabaseConnection(testing);
        console.log(`
        
        
        socket-server.32:   DATABASE CONNECTION CREATED
        
        
        `);
    }

    public static get Instance(){
        SocketServer._instance = (SocketServer._instance) ? SocketServer._instance : new SocketServer();
        return SocketServer._instance;
    }

    public async createDatabaseConnection(testing?: boolean){
        if(!DatabaseService.Instance._initialized){
            if(testing){
                DatabaseService.Instance.testing = true;
            }
            await DatabaseService.Instance.initialize();
            await BaseTableProvider.Instance.initialize();
        }
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || CONNECTION_PARAMETERS.PORT;
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
        this.server.on('close', function(){
            console.log("Server has closed...");
        })

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);
            SocketServerHandler.Instance.handleInstances(socket);
        });

        this.app.get('/downloadBackup/:fileName', async function(req, res, next){
            let exists = await ExportManager.Instance.dumpDoesExist(req.params['fileName']);
            if(!exists){
                console.log(`File doesn't exist...`);
                res.send("DOWNLOAD?...");
                return;
            }
            const fileLocation = ExportManager.Instance.getDumpLocation(req.params['fileName']);
            res.download(fileLocation, req.params['fileName'], function(err){
                console.log(`Downloading file!...`);
                if(err){
                    console.log("Error happened...");
                }else{
                    console.log("No error happened...");
                }
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }

    public closeServer(): Promise<any>{
        return new Promise((accept, reject)=>{
            this.io.close(()=>{
               accept(true);
            });
        });
    }
}