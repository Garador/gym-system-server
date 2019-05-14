import * as path from 'path';

//The main path to the Server folder.
const mainPath = process.cwd().split(`server`)[0]+(()=>{
    return process.cwd().split(`server`)[0].endsWith(path.sep) ? "" : path.sep
})()+"server"+path.sep;

export const MainPath = mainPath;

let commandFilePath:string;
if(process.platform === "win32"){
    commandFilePath = "\\\\";
}else if(process.platform === 'linux'){
    commandFilePath = path.sep;
}
//The path separator element for the command file
export const CommandFilePath = commandFilePath;

const mainFilePath = (()=>{
    return mainPath.replace(/\\/g,commandFilePath);
})()+"server"+commandFilePath;

//The main file path
export const MainFilePath = mainFilePath;