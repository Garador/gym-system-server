import { SocketServer } from '../socket-server';
import * as Path from 'path';
import {Program} from '../commands/main_commands';

export class ArgumentHandler {

    private static _instance: ArgumentHandler;
    private _program:Program;


    public static get Instance(): ArgumentHandler {
        ArgumentHandler._instance = (ArgumentHandler._instance) ? ArgumentHandler._instance : new ArgumentHandler();
        return ArgumentHandler._instance;
    }

    handle() {
        // The second parameter is the path to folder that contains command modules.
        if(process.argv.length>2){
            this._program = new Program();
        }else{
            let app = SocketServer.Instance;
            app.init();
        }
    }
}