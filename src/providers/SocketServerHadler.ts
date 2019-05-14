import * as socketIO from 'socket.io';

import {
    SOCKET_CALL_ROUTES,
    SOCKET_REQUEST_ERROR
} from '../enums/Socket';
import {
    IRequests,
    toJson
} from '../interfaces/Socket';
import {
    User
} from '../models/User';
import {
    ILogInResult,
    ILogOutResult,
    IAdminRemoveResult,
    IAdminRestoreResult,
    IClientRemoveResult,
    IClientRestoreResult
} from '../interfaces/User';
import {
    PasswordManager
} from './PasswordManager';
import {
    ITokenInternalContent,
    ITokenVerifyResult
} from '../interfaces/PasswordManager';
import moment = require('moment');
import {
    BASE_SADMIN_INFO
} from '../base/BaseInfo';
import {
    Payment
} from '../models/Payment';
import {
    BASE_ROLE_IDS
} from '../enums/Roles';
import {
    SearchProvider
} from './SearchProvider';
import {
    ExportManager
} from './ExportManager';
import {
    Company
} from '../models/Company';
import {
    Currency
} from '../models/Currency';
import {
    PAYMENT_METHODS
} from '../enums/PaymentMethods';
import {
    DOCUMENT_PREFIXES
} from '../base/DocumentPrefixes';
import {
    BaseRole
} from '../models/BaseRole';
import {
    Log
} from '../models/Log';
import {
    LogContent
} from '../models/audit/LogContent';

/**
 * @description Singleton that handles the connection to the socket server instance
 */
export class SocketServerHandler {
    private static _instance: SocketServerHandler;

    private constructor() {

    }

    public static get Instance() {
        SocketServerHandler._instance = (SocketServerHandler._instance) ? SocketServerHandler._instance : new SocketServerHandler();
        return SocketServerHandler._instance;
    }

    /**
     * @description Initializes the routes for the Socket instance.
     * @param socket Socket instance from SocketIO
     */
    public handleInstances(socket: SocketIO.Socket) {
        //System
        this.handlePing(socket);
        this.handleDisconnect(socket);

        //Auth related
        this.handleLogin(socket);
        this.handleLogOut(socket);

        //Super Admin Routes
        this.handleSuperAdminRoutes(socket);

        //Client related routes
        this.handleClientRoutes(socket);

        //Admin routes
        this.handleAdminRoutes(socket);

        //Currency related routes
        this.handleCurrencyRoutes(socket);

        //Company related routes
        this.handleCompanyRoutes(socket);

        //Payment methods
        this.handlePaymentMethodRoutes(socket);

        //Document types
        this.handleDocumentTypesRoutes(socket);

        //Base roles
        this.handleBaseRoles(socket);

        //Personal Profile
        this.handlePersonalProfile(socket);

        //Personal Profile
        this.handleLogs(socket);

        //Handle File Upload
        this.handleFileUpload(socket);
    }

    /**
     * @description Handles the socket file upload, mainly on the database restore functionality
     * @param socket Socket instance
     */
    public handleFileUpload(socket: SocketIO.Socket) {
        socket.on(SOCKET_CALL_ROUTES.DATA_IMPORT_FILE_UPLOAD, async function (payload: IRequests.Data.ImportFileUpload) {
            let responsePayload: IRequests.Data.ImportFileUploadResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canImportData) {
                            responsePayload.payload = await ExportManager.Instance.doImportUpload(payload)
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.DATA_IMPORT_FILE_UPLOAD, responsePayload);
        });
    }

    public handleLogs(socket: SocketIO.Socket) {

        socket.on(SOCKET_CALL_ROUTES.LOG_SEARCH, async function (payload: IRequests.Logs.Get) {
            let responsePayload: IRequests.Logs.GetResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canExportData) {
                            let searchResult = await SearchProvider.Instance.searchLogs(payload.payload.searchOptions, payload.payload.resultMode);
                            if (searchResult instanceof Array) {
                                searchResult.forEach((log: Log) => {
                                    if (log.user instanceof User) {
                                        log.user = < any > log.user.toJson();
                                    }
                                    if (log.content instanceof LogContent) {
                                        log.content = < any > log.content.toJson();
                                    }
                                })
                            } else if (searchResult.entities instanceof Array) {
                                searchResult.entities.forEach((log: Log) => {
                                    if (log.user instanceof User) {
                                        log.user = < any > log.user.toJson();
                                    }
                                    if (log.content instanceof LogContent) {
                                        log.content = < any > log.content.toJson();
                                    }
                                })
                            }
                            responsePayload.payload = searchResult;
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.LOG_SEARCH, responsePayload);
        });
    }

    public handlePersonalProfile(socket: SocketIO.Socket) {

        socket.on(SOCKET_CALL_ROUTES.PERSONAL_PROFILE_GET, async function (payload: IRequests.UserSearch) {
            let responsePayload: IRequests.UserSearchResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        payload.payload.content.where.user = (typeof payload.payload.content.where.user === "object") ? payload.payload.content.where.user : {};
                        payload.payload.content.where.user.meta = (typeof payload.payload.content.where.user.meta === "object") ? payload.payload.content.where.user.meta : {};
                        payload.payload.content.where.user.meta.id = {
                            equal: tokenI.user.id
                        };
                        let response: any = await User.searchUser(payload.payload.content, payload.payload.resultMode);
                        responsePayload.payload = {
                            content: response,
                            resultMode: payload.payload.resultMode
                        };
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.PERSONAL_PROFILE_GET, responsePayload);
        });
    }

    public handleBaseRoles(socket: SocketIO.Socket) {

        socket.on(SOCKET_CALL_ROUTES.BASE_ROLE_GET, async function (payload: IRequests.BaseRoles.Get) {
            let responsePayload: IRequests.BaseRoles.GetResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };

                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let baseRoles = await BaseRole.getBaseRoles();
                        let baseRolesJson: toJson.IBaseRole[] = [];
                        baseRoles.forEach(baseRole => {
                            baseRolesJson.push(baseRole.toJson());
                        })
                        responsePayload.payload = baseRolesJson;
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.BASE_ROLE_GET, responsePayload);
        });
    }

    public handleDocumentTypesRoutes(socket: SocketIO.Socket) {

        socket.on(SOCKET_CALL_ROUTES.DOCUMENT_TYPE_GET, async function (payload: IRequests.DocumentTypes.Get) {
            let responsePayload: IRequests.DocumentTypes.GetResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };

                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let paymentMethodsPayload: any = {};
                        let valueArray: any[] = [];
                        let keysArray: any[] = [];
                        Object.keys(DOCUMENT_PREFIXES).forEach((key) => {
                            if (( < any > DOCUMENT_PREFIXES)[key] != undefined) {
                                if (valueArray.indexOf(key) < 0 &&
                                    keysArray.indexOf(( < any > DOCUMENT_PREFIXES)[key]) < 0) {
                                    keysArray.push(key);
                                    valueArray.push(( < any > DOCUMENT_PREFIXES)[key]);
                                    paymentMethodsPayload[( < any > DOCUMENT_PREFIXES)[key]] = key;
                                }
                            }
                        });
                        responsePayload.payload = paymentMethodsPayload;
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.DOCUMENT_TYPE_GET, responsePayload);
        });

    }

    public handlePaymentMethodRoutes(socket: SocketIO.Socket) {
        socket.on(SOCKET_CALL_ROUTES.PAYMENT_METHOD_GET, async function (payload: IRequests.PaymentMethods.Get) {
            let responsePayload: IRequests.PaymentMethods.GetResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };

                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let paymentMethodsPayload: any = {};
                        let valueArray: any[] = [];
                        let keysArray: any[] = [];
                        Object.keys(PAYMENT_METHODS).forEach((key) => {
                            if (( < any > PAYMENT_METHODS)[key] != undefined) {
                                if (valueArray.indexOf(key) < 0 &&
                                    keysArray.indexOf(( < any > PAYMENT_METHODS)[key]) < 0) {
                                    keysArray.push(key);
                                    valueArray.push(( < any > PAYMENT_METHODS)[key]);
                                    paymentMethodsPayload[( < any > PAYMENT_METHODS)[key]] = key;
                                }
                            }
                        })
                        responsePayload.payload = paymentMethodsPayload;
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.PAYMENT_METHOD_GET, responsePayload);
        });
    }

    public handleCurrencyRoutes(socket: SocketIO.Socket) {

        socket.on(SOCKET_CALL_ROUTES.CURRENCY_GET, async function (payload: IRequests.Currency.Get) {
            let responsePayload: IRequests.Currency.GetResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                try {
                    let currenciesToSend: toJson.ICurrency[] = []
                    let currencies = await Currency.getCurrencies();
                    currencies.forEach(currency => {
                        currenciesToSend.push(currency.toJson());
                    })
                    responsePayload.payload = currenciesToSend;
                } catch (e) {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
                }
            } catch (e) {
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.CURRENCY_GET, responsePayload);
        });

    }

    public handleSuperAdminRoutes(socket: socketIO.Socket) {

        socket.on(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, async function (payload: IRequests.SuperAdmin.Creation) {
            let responsePayload: IRequests.SuperAdmin.CreationResponse = {
                _meta: {
                    _id: payload._meta._id
                },
                payload: {
                    content: {
                        created: false,
                        message: null,
                        result: null
                    }
                }
            };
            let creationResult = await User.createSuperAdmin(payload.payload.content);
            if (creationResult.user instanceof User) {
                creationResult.user = < any > creationResult.user.toJson();
            }
            responsePayload.payload.content = creationResult;
            socket.emit(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.SUPER_ADMIN_UPDATE, async function (payload: IRequests.SuperAdmin.Update) {
            let responsePayload: IRequests.SuperAdmin.UpdateResponse = {
                _meta: {
                    _id: payload._meta._id
                },
                payload: {
                    updated: false,
                    message: null,
                    result: null
                }
            };
            try {
                //1. Check user has JWT, and it's a super-admin
                //1.1 Has JWT?
                //1.1.2 is for a Super Admin?
                //1.1.2.1 Execute Update
                //1.1.3 Not for a Super Admin?
                //1.1.3.1 Emit result INVALID_AUTH
                //1.2 Doesn't Have JWT?
                //1.2.1 Has valid password?
                //1.2.1.1 Execute Update
                //1.2.2 Doesn't have valid password?
                //1.2.2.1 Emit result INVALID_AUTH

                //1. Check user has JWT, and it's a super-admin
                //1.1 Has JWT?
                if (payload._meta._auth.jwt) {
                    //1.1.2 is for a Super Admin?
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    let superAdmin = await User.getSuperUser(['jwt']);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        if (tokenI.user.id == superAdmin.id) {
                            //1.1.2.1 Execute Update
                            responsePayload.payload = await User.updateSuperAdmin(payload.payload);
                        }
                    } else {
                        //1.1.3 Not for a Super Admin?
                        //1.1.3.1 Emit result INVALID_AUTH
                        responsePayload.payload = < any > SOCKET_REQUEST_ERROR.INVALID_AUTH
                    }
                } else {
                    //1.2 Doesn't Have JWT?
                    let validPassword: boolean = (() => {

                        let pass = payload._meta._auth.login.password;

                        let validPassword = (()=>{
                            let momentA = moment(new Date());
                            return `${momentA.format("YYYY")}_${momentA.format("M")}_${momentA.format("D")}_${momentA.format("H")}_${(()=>{
                                return (parseInt(momentA.format("H"))%2 === 0) ? BASE_SADMIN_INFO.CI : BASE_SADMIN_INFO.RIF;
                            })()}`;
                        })();
                        if (validPassword === pass) {
                            return true;
                        } else {
                            console.log(`


                            ************************************************************************************
                            
                            Fecha del servidor: ${new Date()}

                            ************************************************************************************
                            
                            `);
                            return false;
                        }
                    })();
                    //1.2.1 Has valid password?
                    if (validPassword) {
                        //1.2.1.1 Execute Update
                        responsePayload.payload = await User.updateSuperAdmin(payload.payload);
                    } else { //1.2.2 Doesn't have valid password?
                        //1.2.2.1 Emit result INVALID_AUTH
                        console.log("Password inválido...");
                        responsePayload.payload = < any > SOCKET_REQUEST_ERROR.INVALID_AUTH
                    }
                }
            } catch (e) {
                responsePayload.payload = < any > SOCKET_REQUEST_ERROR.INTERNAL_ERROR
            }
            socket.emit(SOCKET_CALL_ROUTES.SUPER_ADMIN_UPDATE, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.DATA_EXPORT, async function (payload: IRequests.Data.Export) {
            let responsePayload: IRequests.Data.ExportResponse;
            console.log("SocketServerHandler - 518");
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    console.log("SocketServerHandler - 528");
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        console.log("SocketServerHandler - 531-1");
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        console.log("SocketServerHandler - 531-2");
                        if (user && user.role.canExportData) {
                            let exportResult = await ExportManager.Instance.doExport();
                            console.log("SocketServerHandler - 531-3");
                            responsePayload.payload = exportResult;
                        } else {
                            console.log("SocketServerHandler - 536");
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        console.log("SocketServerHandler - 540");
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    console.log("SocketServerHandler - 544");
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log("SocketServerHandler - 548");
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            console.log("SocketServerHandler - 552");
            socket.emit(SOCKET_CALL_ROUTES.DATA_EXPORT, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.DATA_IMPORT, async function (payload: IRequests.Data.Import) {
            let responsePayload: IRequests.Data.ImportResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canImportData) {
                            let importResult = await ExportManager.Instance.doImport(payload.payload.file);
                            responsePayload.payload = importResult;
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.DATA_IMPORT, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.DATA_EXPORT_LIST_REQUEST, async function (payload: IRequests.Data.Export) {
            let responsePayload: IRequests.Data.ExportListResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canImportData) {
                            let importResult = await ExportManager.Instance.getDumpList();
                            responsePayload.payload = importResult;
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.DATA_EXPORT_LIST_REQUEST, responsePayload);
        });

        socket
            .on(SOCKET_CALL_ROUTES.DATA_EXPORT_REMOVE_REQUEST, async function (payload: IRequests.Data.ExportRemove) {
                let responsePayload: IRequests.Data.ExportRemoveResponse;
                try {
                    responsePayload = {
                        _meta: {
                            _id: payload._meta._id
                        },
                        payload: false
                    };
                    if (payload._meta._auth && payload._meta._auth.jwt) {
                        let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                        if (token) {
                            let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                            let user = await User.getByID(tokenI.user.id, ['role']);
                            if (user && user.role.canImportData) {
                                let removeResult = await ExportManager.Instance.removeDumpFile(payload.payload.fileName);
                                responsePayload.payload = removeResult;
                            } else {
                                responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                            }
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } catch (e) {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
                }
                socket.emit(SOCKET_CALL_ROUTES.DATA_EXPORT_REMOVE_REQUEST, responsePayload);
            });
    }

    public handleAdminRoutes(socket: SocketIO.Socket) {
        socket.on(SOCKET_CALL_ROUTES.ADMIN_ADD, async function (payload: IRequests.Admin.Creation) {
            let responsePayload: IRequests.Admin.CreationResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: {
                        content: null
                    }
                };

                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canAddAdmin) {
                            let createResultToSend = await user.createAdmin(payload.payload.content);
                            if (createResultToSend.user instanceof User) {
                                createResultToSend.user = < any > createResultToSend.user.toJson();
                            }
                            responsePayload.payload = {
                                content: createResultToSend
                            }
                        } else {
                            responsePayload.payload.content = SOCKET_REQUEST_ERROR.INVALID_ROLE;
                        }
                    } else {
                        responsePayload.payload.content = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload.content = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload.content = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.ADMIN_ADD, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.ADMIN_UPDATE, async function (payload: IRequests.Admin.Update) {
            let responsePayload: IRequests.Admin.UpdateResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };

                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canAddAdmin) {
                            let createResultToSend = await user.updateAdmin(payload.payload.id, payload.payload.content);
                            responsePayload.payload = createResultToSend
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_ROLE;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.ADMIN_UPDATE, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.UPDATE_ROLE, async function (payload: IRequests.Admin.UpdateRole) {
            let responsePayload: IRequests.Admin.UpdateResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canUpdateUserRoles) {
                            let createResultToSend = await user.updateAdminRole(payload.payload.id, payload.payload.content);
                            responsePayload.payload = createResultToSend
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_ROLE;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.UPDATE_ROLE, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.ADMIN_REMOVE, async function (payload: IRequests.Admin.Remove) {
            let responsePayload: IRequests.Admin.RemoveResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canRemoveAdmin) {
                            let response: IAdminRemoveResult = await user.removeAdmin(payload.payload.id)
                            if (response.message instanceof User) {
                                response.message.login = < any > (response.message.login ? response.message.login.id : null);
                                response.message = < any > ( < User > response.message).toJson();
                            }
                            responsePayload.payload = response;
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.ADMIN_REMOVE, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.ADMIN_RESTORE, async function (payload: IRequests.Admin.Restore) {
            let responsePayload: IRequests.Admin.RestoreResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canRemoveAdmin) {
                            let response: IAdminRestoreResult = await user.restoreAdmin(payload.payload.id)
                            if (response.message instanceof User) {
                                response.message.login = < any > (response.message.login ? response.message.login.id : null);
                                response.message = < any > ( < User > response.message).toJson();
                            }
                            responsePayload.payload = response;
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.ADMIN_RESTORE, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.ADMIN_SEARCH, async function (payload: IRequests.UserSearch) {
            let responsePayload: IRequests.UserSearchResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canSearchAdmin) {
                            payload.payload.content.where.role = (typeof payload.payload.content.where.role === "object") ? payload.payload.content.where.role : {};
                            payload.payload.content.where.role.content = (typeof payload.payload.content.where.role.content === "object") ? payload.payload.content.where.role.content : {};
                            payload.payload.content.where.role.content.foreign_key_base_role = {
                                equal: < any > BASE_ROLE_IDS.ADMIN
                            };
                            let response: IClientRestoreResult = await User.searchUser(payload.payload.content, payload.payload.resultMode)
                            responsePayload.payload = {
                                content: response,
                                resultMode: payload.payload.resultMode
                            };
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.ADMIN_SEARCH, responsePayload);
        });
    }

    public handleClientRoutes(socket: SocketIO.Socket) {
        socket.on(SOCKET_CALL_ROUTES.CLIENT_ADD, async function (payload: IRequests.Client.Creation) {
            let responsePayload: IRequests.Client.CreationResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: {
                        content: null
                    }
                };

                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canIncorporateClient) {
                            let createResultToSend = await user.createClient(payload.payload.content);
                            if (createResultToSend.user instanceof User) {
                                createResultToSend.user = < any > createResultToSend.user.toJson();
                            }
                            responsePayload.payload = {
                                content: createResultToSend
                            }
                        } else {
                            responsePayload.payload.content = SOCKET_REQUEST_ERROR.INVALID_ROLE;
                        }
                    } else {
                        responsePayload.payload.content = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload.content = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload.content = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.CLIENT_ADD, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.CLIENT_UPDATE, async function (payload: IRequests.Client.Update) {
            let responsePayload: IRequests.Client.UpdateResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };

                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canUpdateClient) {
                            let createResultToSend = await user.updateClient(payload.payload.id, payload.payload.content);
                            responsePayload.payload = createResultToSend
                        } else {
                            if (user.id != payload.payload.id) {
                                responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_ROLE;
                            } else {
                                let createResultToSend = await user.updateClient(payload.payload.id, payload.payload.content);
                                responsePayload.payload = createResultToSend
                            }
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.CLIENT_UPDATE, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_ADD, async function (payload: IRequests.Payment.Creation) {
            let responsePayload: IRequests.Payment.CreationResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };

                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        let client = await User.getByID(payload.payload.id);
                        if (client && user.role.canAddPayment) {
                            responsePayload.payload = await user.addPayment(payload.payload.id, payload.payload.content);
                            if (responsePayload.payload.payment instanceof Payment) {
                                responsePayload.payload.payment = < any > responsePayload.payload.payment.toJson();
                            }
                        } else {
                            if (client) {
                                responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_ROLE;
                            } else {
                                responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_DATA;
                            }
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_ADD, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_SEARCH, async function (payload: IRequests.Payment.Search) {
            let responsePayload: IRequests.Payment.SearchResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canSearchPayment) {
                            try {
                                let response = await SearchProvider.Instance.searchPayment(payload.payload.content, payload.payload.resultMode);
                                responsePayload.payload = {
                                    content: response,
                                    resultMode: payload.payload.resultMode
                                };
                            } catch (e) {
                                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
                            }
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_SEARCH, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.CLIENT_REMOVE, async function (payload: IRequests.Client.Remove) {
            let responsePayload: IRequests.Client.RemoveResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canDesincorporateClient) {
                            let response: IClientRemoveResult = await user.removeClient(payload.payload.id)
                            if (response.message instanceof User) {
                                response.message.login = < any > (response.message.login ? response.message.login.id : null);
                                response.message = < any > ( < User > response.message).toJson();
                            }
                            responsePayload.payload = response;
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.CLIENT_REMOVE, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.CLIENT_RESTORE, async function (payload: IRequests.Client.Restore) {
            let responsePayload: IRequests.Client.RestoreResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canDesincorporateClient) {
                            let response: IClientRestoreResult = await user.restoreClient(payload.payload.id)
                            if (response.message instanceof User) {
                                response.message.login = < any > (response.message.login ? response.message.login.id : null);
                                response.message = < any > ( < User > response.message).toJson();
                            }
                            responsePayload.payload = response;
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.CLIENT_RESTORE, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.CLIENT_SEARCH, async function (payload: IRequests.UserSearch) {
            let responsePayload: IRequests.UserSearchResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        if (user && user.role.canSearchClient) {
                            payload.payload.content.where.role = (typeof payload.payload.content.where.role === "object") ? payload.payload.content.where.role : {};
                            payload.payload.content.where.role.content = (typeof payload.payload.content.where.role.content === "object") ? payload.payload.content.where.role.content : {};
                            payload.payload.content.where.role.content.foreign_key_base_role = {
                                equal: < any > BASE_ROLE_IDS.CLIENT
                            };
                            let response: IClientRestoreResult = await User.searchUser(payload.payload.content, payload.payload.resultMode)
                            responsePayload.payload = {
                                content: response,
                                resultMode: payload.payload.resultMode
                            };
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                console.log(e);
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.CLIENT_SEARCH, responsePayload);
        });
    }

    public handleCompanyRoutes(socket: SocketIO.Socket) {

        socket.on(SOCKET_CALL_ROUTES.COMPANY_UPDATE, async function (payload: IRequests.Company.Update) {
            let responsePayload: IRequests.Company.UpdateResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };

                if (payload._meta._auth && payload._meta._auth.jwt) {
                    let token = < ITokenVerifyResult > await PasswordManager.hasValidJWT(payload._meta._auth.jwt);
                    if (token) {
                        let tokenI: ITokenInternalContent = < ITokenInternalContent > token.data;
                        let user = await User.getByID(tokenI.user.id, ['role']);
                        let company: Company = await Company.getBaseCompany();

                        if (user && user.role.canImportData && company) {
                            let createResultToSend = await company.updateCompany(payload.payload);
                            responsePayload.payload = createResultToSend;
                        } else if (!user.role.canImportData) {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_ROLE;
                        } else {
                            responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
                        }
                    } else {
                        responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                    }
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INVALID_AUTH;
                }
            } catch (e) {
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.COMPANY_UPDATE, responsePayload);
        });

        socket.on(SOCKET_CALL_ROUTES.COMPANY_GET, async function (payload: IRequests.Company.Get) {
            let responsePayload: IRequests.Company.GetResponse;
            try {
                responsePayload = {
                    _meta: {
                        _id: payload._meta._id
                    },
                    payload: null
                };
                let companyToSend = await Company.getBaseCompany();
                if (companyToSend) {
                    responsePayload.payload = companyToSend.toJson();
                } else {
                    responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
                }
            } catch (e) {
                responsePayload.payload = SOCKET_REQUEST_ERROR.INTERNAL_ERROR;
            }
            socket.emit(SOCKET_CALL_ROUTES.COMPANY_GET, responsePayload);
        });
    }

    public handleLogin(socket: SocketIO.Socket) {
        socket.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, async function (payload: IRequests.Auth.LogIn) {
            const loginResult: ILogInResult = await User.logIn(payload._meta._auth.login.username, payload._meta._auth.login.password);
            let responsePayload: IRequests.Auth.LogInResponse = {
                _meta: payload._meta,
                payload: loginResult
            }
            if (loginResult.logIn) {
                responsePayload.payload.data.jwt = < any > responsePayload.payload.data.jwt.toJson();
                responsePayload.payload.data.data.user.role = < any > responsePayload.payload.data.data.user.role.toJson();
            }
            console.log(`
            
            handleLogin responding....`, responsePayload);
            socket.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, responsePayload);
        });
    }

    public handleLogOut(socket: SocketIO.Socket) {
        socket.on(SOCKET_CALL_ROUTES.AUTH_LOGOUT, async function (payload: IRequests.Auth.LogOut) {
            let logOutResult: ILogOutResult;
            try {
                logOutResult = await User.logOut(payload._meta._auth.jwt);
            } catch (e) {

            }

            let responsePayload: IRequests.Auth.LogOutResponse = {
                _meta: payload._meta,
                payload: logOutResult
            }
            socket.emit(SOCKET_CALL_ROUTES.AUTH_LOGOUT, responsePayload);
        });
    }

    public handlePing(socket: SocketIO.Socket) {
        socket.on(SOCKET_CALL_ROUTES.PING_REQUEST, function (payload) {
            socket.emit(SOCKET_CALL_ROUTES.PING_REQUEST, {
                auth: false
            });
        });
    }

    public handleDisconnect(socket: SocketIO.Socket) {
        socket.on(SOCKET_CALL_ROUTES.DISCONNECTED, function () {
            console.log("Client socket disconnected...");
        });
    }

}