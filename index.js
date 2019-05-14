"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var socket_server_1 = require("./socket-server");
var app = new socket_server_1.SocketServer().getApp();
exports.app = app;
