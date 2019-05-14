"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
require("reflect-metadata");
var typeorm_1 = require("typeorm");
var Todo_1 = require("./entity/Todo");

var SocketServer = /** @class */ (function () {
    function SocketServer() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }
    SocketServer.prototype.createDatabaseConnection = function () {
        return new Promise(function (accept, reject) {
            typeorm_1.createConnection({
                type: "sqlite",
                synchronize: true,
                logging: true,
                logger: "simple-console",
                database: "database.sqlite",
                entities: [
                    Todo_1.TodoEntity
                ]
            });
        });
    };
    SocketServer.prototype.createApp = function () {
        this.app = express();
    };
    SocketServer.prototype.createServer = function () {
        this.server = http_1.createServer(this.app);
    };
    SocketServer.prototype.config = function () {
        this.port = process.env.PORT || SocketServer.PORT;
    };
    SocketServer.prototype.sockets = function () {
        this.io = socketIo(this.server);
    };
    SocketServer.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        this.io.on('connect', function (socket) {
            console.log('Connected client on port %s.', _this.port);
        });
    };
    SocketServer.prototype.getApp = function () {
        return this.app;
    };
    SocketServer.PORT = 8080;
    return SocketServer;
}());
exports.SocketServer = SocketServer;
