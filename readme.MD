#How to use
In order to use, download this repository and install packages. Please keep in mind the recommended node version is at least 9.0.0.

#Start Server
In order to start the server, run:
> `node dist/index.js`

#Test the server
In order to E2E test, run the following command:
> `npm run test`

#Server Commands
The server commands are designed to directly interact with the main system that servers as base to the client system. If the server data gets corrupted, the client won't be able to access it, and the previous operations won't be possible. Thus, the server commands are designed to interact with the server directly.

##Export Data (export)
The export command is used to generate a backup file on the specified directory.
The command syntax is as follows:
`$LOCACION_NODE $LOCACION_INDEX export $LOCACION_EXPORT`

**Where**:

> `$LOCACION_NODE` The node v9.11.2 executable version.

>  `$LOCACION_INDEX` The index.js file location.

> `$LOCACION_EXPORT` the output directory where the file will be stored.

**Example** From the main folder, the command would be:
`.\bin\node\node-v9.11.2-win-x86\node.exe .\server\dist\index.js export C:\Respaldos`

##Restore Data (restore)
The restore data serves to read a dump file produced by export command an replace the current production database.
The syntax for the command is as follows:
> `$LOCACION_NODE $LOCACION_INDEX restore $LOCACION_EXPORT`

**Where**

> `$LOCACION_NODE` It's the nodeJS v9.11.2 node executable location

>  `$LOCACION_INDEX` It's the index.js node location file.

> `$LOCACION_EXPORT` It's the dump file.


**Example** From the main directory, the command would be as follows:
> `.\bin\node\node-v9.11.2-win-x86\node.exe .\server\dist\index.js restore C:\Respaldos\2018_02_15_20_30.zip`

##Translate and import text files (parse)
This commands works to read the text files from certain directory, translate them and compare them with existing records.
The syntaxis for the commands is as follows:
`$LOCACION_NODE $LOCACION_INDEX parse $LOCACION_EXPORT`

**Where**

> `$LOCACION_NODE` It's the NodeJS v9.11.2 executable location

>  `$LOCACION_INDEX` It's the index.js server file location

> `$LOCACION_EXPORT` It's the directory location having the text files

>`$LOGGING` Group of tree digits that will mark the log level that will be shown from the operation. This will be denoted by 3 consecutive digits that can be 1 or 0, and will represent the log level that wants to be acchieved.

> \* First digit  [ (1)00 ]: Will generate a log with new records.
> \* Second digit [ 0(1)0 ]: Will generate a log that will include the existing records update
> \* Third digit [ 00(1) ]: Will generate a basic log from the record obtained from the text file

**Example** From the main folder, the command would be:
> `.\bin\node\node-v9.11.2-win-x86\node.exe .\server\dist\index.js` `parse C:\GYM 100`

##bin directory files
The bin folder contains the sqlitetools N*. 3260000, that will enable database handling services.
They contain sqldiff, sqlite3 and sqlite3_analyzer, both in `sqlite-tools-linux-x86-3260000` directory for linux distributions and `sqlite-tools-win32-x86-3260000` for windows distributions. They can be downloaded from **https://sqlite.org/download.html**.

##DOCS directory
The main docs, in spanish, for the server system.

##sql directory
There are examples of SQLite sentences used by the system