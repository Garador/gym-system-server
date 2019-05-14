import {
    expect
} from 'chai';
import {describe, it, before, after} from 'mocha';
import {
    DatabaseService
} from '../src/providers/databaseAdmin';
import {
    BaseTableProvider
} from '../src/providers/BaseTableProvider';
import {
    User
} from '../src/models/User';
import {
    Company
} from '../src/models/Company';
import {
    ITokenInterface
} from "../src/interfaces/PasswordManager";
import {
    Jwt
} from '../src/models/Jwt';
import {
    SuperAdminCreationResult,
    ClientCreationResult,
    ClientUpdateResult,
    PaymentAddResult,
    ClientRemoveResult,
    ClientRestoreResult,
    AdminRemoveResult,
    AdminRestoreResult,
    UserSearchResultMode,
    AdminUpdateResult,
    ClientStatus,
    ValidPayloadCodes
} from '../src/enums/User';
import {
    ISuperAdminCreationPayload,
    IAdminCreationPayload,
    IAdminUpdatePayload,
    IClientCreationPayload,
    IRoleUpdatePayload,
    IUserSearchOptions,
    ISuperAdminUpdateResult,
    IAdminUpdateResult,
    IAdminRemoveResult,
    IAdminRestoreResult,
    IClientCreationResult,
    IClientUpdateResult,
    IPaymentAddResult,
    IClientRemoveResult,
    IClientRestoreResult,
    ISuperAdminCreationResult
} from '../src/interfaces/User';
import {
    DOCUMENT_PREFIXES
} from '../src/base/DocumentPrefixes';
import moment = require('moment');
import {
    PAYMENT_METHODS
} from '../src/enums/PaymentMethods';
import {
    SearchProvider
} from '../src/providers/SearchProvider';
import {
    PaymentResultMode
} from '../src/enums/Payment';
import {
    Payment
} from '../src/models/Payment';
import * as socket_client from 'socket.io-client';
import {
    CONNECTION_PARAMETERS,
    SOCKET_CALL_ROUTES,
    SOCKET_REQUEST_ERROR
} from '../src/enums/Socket';
import {
    IRequests, toJson
} from '../src/interfaces/Socket';

import {Document as Doc} from '../src/models/Document';

import {
    SocketServer
} from '../src/socket-server';
import * as child_process from 'child_process'
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as JSZip from 'jszip';
import * as http from 'http';
import {ExportManager, RecordParseDataObject} from '../src/providers/ExportManager';

import {createConnection, Connection} from 'typeorm';
import { BaseRole } from '../src/models/BaseRole';
import { Currency } from '../src/models/Currency';
import { DB_FILE_LOC } from '../src/enums/Database';
import { ExportResultCode, ImportResultCode } from '../src/enums/ExportManager';
import { SyntaxErrorCodes } from '../src/enums/SyntaxValidationProvider';
import { BASE_SADMIN_INFO } from '../src/base/BaseInfo';
import { IValidateAdminPayloadResult } from '../src/interfaces/SyntaxValidationProvider';
import { Role } from '../src/models/Role';
import { IPaymentSearchOption } from '../src/interfaces/Payment';
import { IExportResult, IImportResult, IFileUploadResult } from '../src/interfaces/ExportManager';
import { CompanyUpdateResult } from '../src/enums/Company';
import { ICompanyUpdateResult } from '../src/interfaces/Company';
import { ILogSearchOptions } from '../src/interfaces/Log';
import { LogResultMode } from '../src/enums/Log';
import { Membership } from '../src/models/Membership';
import { MembershipStatus } from '../src/enums/Membership';
import { DocumentStatus } from '../src/enums/Document';

const superAdminData: ISuperAdminCreationPayload = {
    username: "SuperAdmin",
    password: "1234567890",
    firstName: "PepeSuper",
    surName: "SuperAdmin SurName",
    address: `Calle Gibraltar, Casa N°. ${Math.floor(Math.random()*99999)}`,
    phone: `+58412${Math.floor(Math.random()*9999999)}`,
    document:{
        prefix: DOCUMENT_PREFIXES.CI,
        content: "987654321"
    }
};
const admin1Data: IAdminCreationPayload = {
    username: "Admin",
    password: "1234567890",
    firstName: "Admin",
    surName: "Primero",
    address: `Calle Machelin, Casa N°. ${Math.floor(Math.random()*99999)}`,
    phone: `+58412${Math.floor(Math.random()*9999999)}`,
    document:{
        prefix: DOCUMENT_PREFIXES.CI,
        content: "123456789"
    }
};
const admin2Data: IAdminCreationPayload = {
    username: "Admin_2",
    password: "admin_22157171",
    firstName: "AdminSecond FirstName",
    surName: "AdminSecond SurName",
    address: `Calle Pony, Casa N°. ${Math.floor(Math.random()*99999)}`,
    phone: `+58412${Math.floor(Math.random()*9999999)}`
};
const admin3Data: IAdminCreationPayload = {
    username: "ToDelete",
    password: "admin_22157171",
    firstName: "Admin ToDelete FirstName",
    surName: "Admin ToDelete SurName",
    address: `Calle Casona, Casa N°. ${Math.floor(Math.random()*99999)}`,
    phone: `+58412${Math.floor(Math.random()*9999999)}`
};
const admin4LogicalRestore: IAdminCreationPayload = {
    username: "adminToLogicallyRestore",
    password: "admin_22157171",
    firstName: "Admin ToDelete FirstName",
    surName: "Admin ToDelete SurName",
    address: `Calle Macuto, Casa N°. ${Math.floor(Math.random()*99999)}`,
    phone: `+58412${Math.floor(Math.random()*9999999)}`
};

const client1Data: IClientCreationPayload = {
    firstName: "Gerónimo",
    surName: "Mata",
    address: `Calle Macuto, Casa N°. ${Math.floor(Math.random()*99999)}`,
    phone: `+58412${Math.floor(Math.random()*9999999)}`,
    document: {
        prefix: DOCUMENT_PREFIXES.CI,
        content: "20606280",
        image: null
    },
    membership: {
        cutDate: moment().add(1, 'month').toDate().getTime(),
        monthAmmount: 2000,
        inscriptionDate: moment.now()
    }
};

const client2Data: IClientCreationPayload = {
    firstName: "Lol Firstname",
    surName: "Otro Cliente",
    address: `Calle Macuto, Casa N°. ${Math.floor(Math.random()*99999)}`,
    phone: `+58412${Math.floor(Math.random()*9999999)}`,
    document: {
        prefix: DOCUMENT_PREFIXES.CI,
        content: "325554785",
        image: null
    },
    membership: {
        cutDate: moment().add(2, 'month').toDate().getTime(),
        monthAmmount: 2000,
        inscriptionDate: moment.now()
    }
};

const client3Data: IClientCreationPayload = {
    firstName: "Luis Firstname Tres",
    surName: "Armando Surname Tres",
    address: `Calle Macuto, Casa N°. ${Math.floor(Math.random()*99999)}`,
    phone: `+58412${Math.floor(Math.random()*9999999)}`,
    document: {
        prefix: DOCUMENT_PREFIXES.CI,
        content: "254786614",
        image: null
    },
    membership: {
        cutDate: moment().add(3, 'month').toDate().getTime(),
        monthAmmount: 2000,
        inscriptionDate: moment.now()
    }
};

const client4PhysicalDelete: IClientCreationPayload = {
    firstName: "To Delete Physical",
    surName: "To Delete Physical",
    address: `Calle Macuto, Casa N°. ${Math.floor(Math.random()*99999)}`,
    phone: `+58412${Math.floor(Math.random()*9999999)}`,
    
    document: {
        prefix: DOCUMENT_PREFIXES.CI,
        content: "547711236",
        image: null
    },
    membership: {
        cutDate: moment().add(3, 'month').toDate().getTime(),
        monthAmmount: 2000,
        inscriptionDate: moment.now()
    }
};

const client5LogicalDelete: IClientCreationPayload = {
    firstName: "To Delete Logical",
    surName: "To Delete Logical",
    address: `Calle Macuto, Casa N°. ${Math.floor(Math.random()*99999)}`,
    phone: `+58412${Math.floor(Math.random()*9999999)}`,
    document: {
        prefix: DOCUMENT_PREFIXES.CI,
        content: "1112344",
        image: null
    },
    membership: {
        cutDate: moment().add(3, 'month').toDate().getTime(),
        monthAmmount: 2000,
        inscriptionDate: moment.now()
    }
};

describe("Test the base functionality", function () {



    describe("Tests the basic functionality", function () {
        before('Prepares the database', async function () {
            this.timeout(6000);
            DatabaseService.Instance.testing = true;
            try {
                await DatabaseService.Instance.initialize();
                await BaseTableProvider.Instance.initialize();
            } catch (e) {
                console.log("ERROR...", e);
            }
        });

        it('Check database initialization', function () {
            expect(DatabaseService.Instance.connection).to.not.equal(undefined);
        });

    })

    describe("Checks the Database initialization...", function () {
        before('Prepares the database', async function () {
            this.timeout(6000);
            DatabaseService.Instance.testing = true;
            try {
                await DatabaseService.Instance.initialize();
                await BaseTableProvider.Instance.initialize();
            } catch (e) {
                console.log("ERROR...", e);
            }
        });

        it('Should check the Log-in...', async function () {
            try {
                let user = await User.logIn("admin", "admin");
            } catch (e) {
                console.log(e);
                expect(e).to.not.be.equal(null);
            }
        })

        it('Should check the base table handler - Roles', async function () {
            expect(BaseTableProvider.Instance.baseRoles.length).to.be.greaterThan(0);
        });

        it('Should check the base table handler - Currency', async function () {
            expect(BaseTableProvider.Instance.baseCurrency.length).to.be.greaterThan(0);
        });

        it('Should check the base table handler - Company', async function () {
            expect(BaseTableProvider.Instance.baseCompany).to.be.instanceOf(Company);
        });
    })

    describe("Checks the User basic user-related functions", function () {
        before("Prepares the database", async function () {
            this.timeout(6000);
            DatabaseService.Instance.testing = true;
            try {
                await DatabaseService.Instance.initialize();
                await BaseTableProvider.Instance.initialize();
            } catch (e) {
                console.log("ERROR...", e);
            }
        });

        describe("Tests the SuperAdmin functions", function () {


            it('Should test the SuperAdmin - Creation', async function () {
                this.timeout(8000);
                let creationResult: ISuperAdminCreationResult;

                let invalidDataA: ISuperAdminCreationPayload = JSON.parse(JSON.stringify(superAdminData));

                //Invalid Username
                invalidDataA.username = "ss";
                creationResult = await User.createSuperAdmin(invalidDataA);
                expect(creationResult.created).to.be.equal(false);
                expect(creationResult.user).to.be.equal(null);
                expect(creationResult.result).to.be.equal(SuperAdminCreationResult.INVALID_DATA);

                //Invalid surName
                invalidDataA.username = "penpee";
                invalidDataA.surName = "s";
                creationResult = await User.createSuperAdmin(invalidDataA);
                expect(creationResult.created).to.be.equal(false);
                expect(creationResult.user).to.be.equal(null);
                expect(creationResult.result).to.be.equal(SuperAdminCreationResult.INVALID_DATA);

                //Invalid Password
                invalidDataA.username = "penpee32";
                invalidDataA.password = "22";
                creationResult = await User.createSuperAdmin(invalidDataA);
                expect(creationResult.created).to.be.equal(false);
                expect(creationResult.user).to.be.equal(null);
                expect(creationResult.result).to.be.equal(SuperAdminCreationResult.INVALID_DATA);

                //Invalid firstName
                invalidDataA.password = "penpee32";
                invalidDataA.firstName = "2"
                creationResult = await User.createSuperAdmin(invalidDataA);
                expect(creationResult.created).to.be.equal(false);
                expect(creationResult.user).to.be.equal(null);
                expect(creationResult.result).to.be.equal(SuperAdminCreationResult.INVALID_DATA);

                //We create the super-admin
                creationResult = await User.createSuperAdmin(superAdminData);
                expect(creationResult.created).to.be.equal(true);
                expect(creationResult.user).to.be.instanceOf(User);

                //User Already Exists
                creationResult = await User.createSuperAdmin(superAdminData);
                expect(creationResult.created).to.be.equal(false);
                expect(creationResult.user).to.be.equal(null);
                expect(creationResult.result).to.be.equal(SuperAdminCreationResult.USER_ALREADY_EXISTS);

            });

            it("Should test basic log-in, log-out", async function () {
                let loginResult = await User.logIn("123123", "asasdads");
                console.log(`
            

            loginResult: 
            `, JSON.stringify(loginResult));
            })

            it('Should test the SuperAdmin - Login and LogOut', async function () {
                this.timeout(8000);
                let loginResult = await User.logIn(superAdminData.username, superAdminData.password);

                expect(loginResult.data).not.to.be.equal(null);

                let tokenI: ITokenInterface = < any > loginResult.data;
                expect(tokenI.jwt).to.be.instanceOf(Jwt);

                let logoutResult = await User.logOut(tokenI.token);
                expect(logoutResult.logOut).to.be.equal(true);
            });

            it('Should test the SuperAdmin Update.', async function () {
                this.timeout(20000);

                let superAdmin: User = await User.getSuperUser();
                expect(superAdmin).to.be.instanceOf(User);
                let payloadUpdate = {
                    username: "Lorenzo",
                    password: "123456",
                    firstName: "Lorenzo",
                    surName: "Martinez"
                };
                await User.updateSuperAdmin({
                    username: payloadUpdate.username
                });
                superAdmin = await User.getSuperUser(['login']);


                await User.updateSuperAdmin({
                    firstName: payloadUpdate.username
                });
                superAdmin = await User.getSuperUser();
                expect(superAdmin.firstName).is.equal(payloadUpdate.firstName);
                await User.updateSuperAdmin({
                    surName: payloadUpdate.surName
                });
                superAdmin = await User.getSuperUser();
                expect(superAdmin.surName).is.equal(payloadUpdate.surName);


                await User.updateSuperAdmin({
                    username: payloadUpdate.username
                });
                superAdmin = await User.getSuperUser(['login']);
                expect(superAdmin.surName).is.equal(payloadUpdate.surName);

                await User.updateSuperAdmin({
                    password: payloadUpdate.password
                });

                let loginResult = await User.logIn(superAdmin.login.username, payloadUpdate.password);

                expect(loginResult.data).not.to.be.equal(null);

                let tokenI: ITokenInterface = < any > loginResult.data;
                expect(tokenI.jwt).to.be.instanceOf(Jwt);

                let logoutResult = await User.logOut(tokenI.token);
                expect(logoutResult.logOut).to.be.equal(true);



                /**/
            });
        })

        describe("Tests the Admin functions", function () {
            let superAdmin: User;
            let admin3ID: number;
            before("Load the SuperAdmin", async () => {
                superAdmin = await User.getSuperUser();
            })

            it('Creates 3 Admin Accounts', async function () {
                this.timeout(12000);
                let creationResult = await superAdmin.createAdmin(admin1Data);
                expect(creationResult.created).to.be.equal(true);
                expect(creationResult.user).to.be.instanceOf(User);

                creationResult = await superAdmin.createAdmin(admin2Data);
                //console.log("\n\n\n\n\n\n\n\n\n");
                //console.log(creationResult);
                //console.log("\n\n\n\n\n\n\n\n\n");
                expect(creationResult.created).to.be.equal(true);
                expect(creationResult.user).to.be.instanceOf(User);

                creationResult = await superAdmin.createAdmin(admin3Data);
                //console.log("\n\n\n\n\n\n\n\n\n");
                //console.log(creationResult);
                //console.log("\n\n\n\n\n\n\n\n\n");            
                expect(creationResult.created).to.be.equal(true);
                expect(creationResult.user).to.be.instanceOf(User);
                admin3ID = creationResult.user.id;

                creationResult = await superAdmin.createAdmin(admin4LogicalRestore);
                console.log("\n\n\n\n\n\n\n\n\n");
                console.log(creationResult);
                console.log("\n\n\n\n\n\n\n\n\n");
                expect(creationResult.created).to.be.equal(true);
                expect(creationResult.user).to.be.instanceOf(User);
            });

            it('LogIn and LogOut', async function () {
                this.timeout(12000);
                //Admin1 Login
                let loginResult;
                let logoutResult;
                /*
                let loginResult = await User.logIn(admin1Data.username, admin1Data.password);
                expect(loginResult.data).not.to.be.equal(null);
                expect(loginResult.data.jwt).to.be.instanceOf(Jwt);
                let logoutResult = await User.logOut(loginResult.data.token);
                expect(logoutResult.logOut).to.be.equal(true);
                */

                //Admin3 Login
                /*
                loginResult = await User.logIn(admin3Data.username, admin3Data.password);
                expect(loginResult.data).not.to.be.equal(null);
                expect(loginResult.data.jwt).to.be.instanceOf(Jwt);
                logoutResult = await User.logOut(loginResult.data.token);
                expect(logoutResult.logOut).to.be.equal(true);
                */

                //Admin4 Login
                loginResult = await User.logIn(admin4LogicalRestore.username, admin4LogicalRestore.password);
                expect(loginResult.data).not.to.be.equal(null);
                expect(loginResult.data.jwt).to.be.instanceOf(Jwt);
                logoutResult = await User.logOut(loginResult.data.token);
                expect(logoutResult.logOut).to.be.equal(true);
            });

            it('Updates an admin profile', async function () {
                this.timeout(12000);
                let admin: User = await User.getByUsername(admin1Data.username, ['login']);
                let admin3: User = await User.getByUsername(admin3Data.username, ['login']);
                expect(admin).to.be.instanceOf(User);

                let payloadUpdate: IAdminUpdatePayload = {
                    username: "ActualiazadoUsername",
                    password: "123456789",
                    firstName: "ActualizadoNombre",
                    surName: "ActualizadoApellido",
                    document: {
                        prefix: DOCUMENT_PREFIXES.CI,
                        content: "254447485"
                    }
                };
                let userUpdateResult = await superAdmin.updateAdmin(admin.id, {
                    username: payloadUpdate.username
                });
                //console.log("\n\n\n\n\n\n\n\n************************");
                //console.log(userUpdateResult);
                //console.log("************************\n\n\n\n\n\n\n\n");
                admin = await User.getByID(admin.id, ['login']);
                //console.log("\n\n\n\n\n\n\n\n************************");
                //console.log(admin);
                //console.log("************************\n\n\n\n\n\n\n\n");
                expect(admin.login.username).is.equal(payloadUpdate.username);


                await superAdmin.updateAdmin(admin.id, {
                    firstName: payloadUpdate.firstName
                });
                admin = await User.getByID(admin.id, ['login']);
                expect(admin.firstName).is.equal(payloadUpdate.firstName);


                await superAdmin.updateAdmin(admin.id, {
                    surName: payloadUpdate.surName
                });
                admin = await User.getByID(admin.id, ['login']);
                expect(admin.surName).is.equal(payloadUpdate.surName);


                await superAdmin.updateAdmin(admin.id, {
                    document: payloadUpdate.document
                });
                admin = await User.getByID(admin.id, ['document', 'login']);
                expect(admin.document.content).is.equal(payloadUpdate.document.content);


                await superAdmin.updateAdmin(admin.id, {
                    password: payloadUpdate.password
                });

                let loginResult = await User.logIn(admin.login.username, payloadUpdate.password);

                expect(loginResult.data).not.to.be.equal(null);

                let tokenI: ITokenInterface = < any > loginResult.data;
                expect(tokenI.jwt).to.be.instanceOf(Jwt);

                let logoutResult = await User.logOut(tokenI.token);
                expect(logoutResult.logOut).to.be.equal(true);

                //Creamos un documento de identidad a Admin3

                await superAdmin.updateAdmin(admin3.id, {
                    document: {
                        prefix: DOCUMENT_PREFIXES.CI,
                        content: "547774852"
                    }
                });
            });

            it('Update an Admin Role', async function () {
                this.timeout(12000);
                let admin: User = await User.getByUsername(admin3Data.username, ['role']);
                expect(admin).to.be.instanceOf(User);
                expect(superAdmin).to.be.instanceOf(User);

                let newPayload: IRoleUpdatePayload = {
                    role: {
                        canAddAdmin: !admin.role.canAddAdmin,
                        canAddPayment: !admin.role.canAddPayment,
                        canChangePassword: !admin.role.canChangePassword,
                        canDesincorporateClient: !admin.role.canDesincorporateClient,
                        canExportData: !admin.role.canExportData,
                        canImportData: !admin.role.canImportData,
                        canIncorporateClient: !admin.role.canIncorporateClient,
                        canLogin: !admin.role.canLogin,
                        canRemoveAdmin: !admin.role.canRemoveAdmin,
                        canRemovePayment: !admin.role.canRemovePayment,
                        canSearchAdmin: !admin.role.canSearchAdmin,
                        canSearchClient: !admin.role.canSearchClient,
                        canSearchPayment: !admin.role.canSearchPayment,
                        canUpdateAdmin: !admin.role.canUpdateAdmin,
                        canUpdateClient: !admin.role.canUpdateClient,
                        canUpdatePayment: !admin.role.canUpdatePayment,
                        canUpdateUserRoles: !admin.role.canUpdateUserRoles
                    }
                }

                let updateResult = await superAdmin.updateAdminRole(admin.id, {
                    role: newPayload.role
                });
                expect(updateResult.updated).to.be.equal(true);
                admin = await User.getByID(admin.id, ['role']);

                Object.keys(newPayload.role).forEach((key: string) => {
                    if (typeof admin.role[key] === "boolean") {
                        if (admin.role[key] != newPayload.role[key]) {
                            console.log(`Role not saved: ${key}`);
                        }
                        expect(admin.role[key]).to.be.equal(newPayload.role[key]);
                        expect(admin.role[key]).to.be.equal(newPayload.role[key]);
                    }
                });

            });

            it('Should remove admin 3 (physical) and 4 (logical)', async function () {
                this.timeout(6000);
                let admin: User = await User.getByUsername(admin3Data.username);
                let removalResult = await superAdmin.removeAdmin(admin.id);
                expect(removalResult.removed).to.be.eq(true);
                expect(removalResult.result).to.be.eq(AdminRemoveResult.SUCCESS_PHYSICAL);

                admin = await User.getByUsername(admin4LogicalRestore.username);
                removalResult = await superAdmin.removeAdmin(admin.id);
                expect(removalResult.removed).to.be.eq(true);
                expect(removalResult.result).to.be.eq(AdminRemoveResult.SUCCESS_LOGICAL);
            });

            it('Should restore admin 4 (logical)', async function () {
                this.timeout(6000);
                let admin: User = await User.getByUsername(admin4LogicalRestore.username);
                let restoreResult = await superAdmin.restoreAdmin(admin.id);
                expect(restoreResult.restored).to.be.eq(true);

                restoreResult = await superAdmin.restoreAdmin(admin3ID);
                expect(restoreResult.restored).to.be.eq(false);
                expect(restoreResult.result).to.be.eq(AdminRestoreResult.USER_NOT_FOUND);
            });
        });

        describe("Tests the Client Functions", function () {

            it('Should test the Client - Creation', async function () {
                this.timeout(12000);
                let loginResult = await User.logIn(admin2Data.username, admin2Data.password);
                console.log(`
            
            
            
            loginResult: `, loginResult, `
            
            
            
            
            `);
                expect(loginResult.data).not.to.be.equal(null);
                expect(loginResult.data.jwt).to.be.instanceOf(Jwt);

                const admin = await User.getByUsername(admin2Data.username, null);
                let clientCreationResult = await admin.createClient(client1Data);
                expect(clientCreationResult.user).to.be.instanceOf(User);

                clientCreationResult = await admin.createClient(client1Data);
                expect(clientCreationResult.created).to.be.eq(false);
                expect(clientCreationResult.result).to.be.equal(ClientCreationResult.USER_ALREADY_EXISTS);

                //Creamos el segundo cliente
                clientCreationResult = await admin.createClient(client2Data);
                expect(clientCreationResult.user).to.be.instanceOf(User);

                let badData = client1Data;
                badData.firstName = "2";
                clientCreationResult = await admin.createClient(badData);
                expect(clientCreationResult.created).to.be.eq(false);
                expect(clientCreationResult.result).to.be.equal(ClientCreationResult.INVALID_DATA);


                badData = client1Data;
                badData.surName = "3";
                clientCreationResult = await admin.createClient(badData);
                expect(clientCreationResult.created).to.be.eq(false);
                expect(clientCreationResult.result).to.be.equal(ClientCreationResult.INVALID_DATA);


                badData = client1Data;
                badData.document.content = "fs";
                clientCreationResult = await admin.createClient(badData);
                expect(clientCreationResult.created).to.be.eq(false);
                expect(clientCreationResult.result).to.be.equal(ClientCreationResult.INVALID_DATA);

                //Creamos el tercer cliente
                clientCreationResult = await admin.createClient(client3Data);
                expect(clientCreationResult.user).to.be.instanceOf(User);
                //4to y 5to cliente
                clientCreationResult = await admin.createClient(client4PhysicalDelete);
                expect(clientCreationResult.user).to.be.instanceOf(User);
                clientCreationResult = await admin.createClient(client5LogicalDelete);
                expect(clientCreationResult.user).to.be.instanceOf(User);
            });

            it('Should test the Client - Update', async function () {
                this.timeout(12000);
                let loginResult = await User.logIn(admin2Data.username, admin2Data.password);
                //console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
                //console.log("\n\nLOGIN RESULT:\n\n");
                //console.log(loginResult);
                //console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
                expect(loginResult.data).not.to.be.equal(null);
                expect(loginResult.data.jwt).to.be.instanceOf(Jwt);

                const admin = await User.getByUsername(admin2Data.username, null);
                let client = await User.getByDocument(
                    client2Data.document.prefix, client2Data.document.content,
                    ['document', 'membership']);
                expect(client).to.be.instanceOf(User);
                const clientID = client.id;

                let newData = client2Data;
                newData.document.content = "00000255474"
                newData.document.prefix = DOCUMENT_PREFIXES.P;
                newData.membership.monthAmmount = 350000;


                let clientUpdateResult = await admin.updateClient(clientID, {
                    document: client2Data.document,
                    membership: newData.membership
                });
                expect(clientUpdateResult.result).to.be.equal(ClientUpdateResult.SUCCESS);
                client = await User.getByID(clientID, ['document']);
                expect(client.document.content).to.be.equal(newData.document.content);

                let continueA = true;
                if (!continueA) {
                    return;
                }
                newData.document.prefix = DOCUMENT_PREFIXES.CI;
                clientUpdateResult = await admin.updateClient(clientID, {
                    document: {
                        prefix: newData.document.prefix,
                        content: "ff651121asd"
                    }
                });
                expect(clientUpdateResult.result).to.be.equal(ClientUpdateResult.INVALID_DATA);
                client = await User.getByID(clientID, ['document']);
                expect(client.document.content).to.be.equal(newData.document.content);

                newData.firstName = newData.firstName + " Updated";
                clientUpdateResult = await admin.updateClient(clientID, {
                    firstName: newData.firstName
                });
                expect(clientUpdateResult.result).to.be.equal(ClientUpdateResult.SUCCESS);
                client = await User.getByID(clientID, ['document']);
                expect(client.firstName).to.be.equal(newData.firstName);

                clientUpdateResult = await admin.updateClient(clientID, {
                    firstName: "2"
                });
                expect(clientUpdateResult.result).to.be.equal(ClientUpdateResult.INVALID_DATA);
                client = await User.getByID(clientID);
                expect(client.firstName).to.be.equal(newData.firstName);

                newData.surName = newData.surName + " Updated";
                clientUpdateResult = await admin.updateClient(clientID, {
                    surName: newData.surName
                });
                expect(clientUpdateResult.result).to.be.equal(ClientUpdateResult.SUCCESS);
                client = await User.getByID(clientID, ['document']);
                expect(client.surName).to.be.equal(newData.surName);

                clientUpdateResult = await admin.updateClient(clientID, {
                    surName: "3"
                });
                expect(clientUpdateResult.result).to.be.equal(ClientUpdateResult.INVALID_DATA);
                client = await User.getByID(clientID);
                expect(client.surName).to.be.equal(newData.surName);

                clientUpdateResult = await admin.updateClient(clientID, {
                    membership: {
                        cutDate: 20
                    }
                });
                expect(clientUpdateResult.result).to.be.equal(ClientUpdateResult.INVALID_DATA);
                client = await User.getByID(clientID, ['membership']);
                expect(client.membership.cutDate).to.not.be.equal(20);

                newData.membership.cutDate = moment().add(3, 'months').toDate().getTime();
                clientUpdateResult = await admin.updateClient(clientID, {
                    membership: {
                        cutDate: newData.membership.cutDate
                    }
                });
                expect(clientUpdateResult.result).to.be.equal(ClientUpdateResult.SUCCESS);
                client = await User.getByID(clientID, ['membership']);
                expect(client.membership.cutDate.getTime()).to.be.equal(newData.membership.cutDate);

                clientUpdateResult = await admin.updateClient(clientID, {
                    membership: {
                        inscriptionDate: 20
                    }
                });
                expect(clientUpdateResult.result).to.be.equal(ClientUpdateResult.INVALID_DATA);
                client = await User.getByID(clientID, ['membership']);
                expect(client.membership.inscriptionDate).to.not.be.equal(20);

                newData.membership.inscriptionDate = moment().add(3, 'months').toDate().getTime();
                clientUpdateResult = await admin.updateClient(clientID, {
                    membership: {
                        inscriptionDate: newData.membership.inscriptionDate
                    }
                });
                expect(clientUpdateResult.result).to.be.equal(ClientUpdateResult.SUCCESS);
                client = await User.getByID(clientID, ['membership']);
                expect(client.membership.inscriptionDate.getTime()).to.be.equal(newData.membership.inscriptionDate);
            });

            it('Should test the Client Payment - Add', async function () {
                this.timeout(6000);
                const admin = await User.getByUsername(admin2Data.username, null);
                const client: User = await User.getByDocument(client3Data.document.prefix, client3Data.document.content);
                const clientB: User = await User.getByDocument(client5LogicalDelete.document.prefix, client5LogicalDelete.document.content);
                expect(client).to.be.instanceOf(User);
                let paymentResult = await admin.addPayment(client.id, {
                    payment: {
                        ammount: 2540000,
                        currency: "VES",
                        method: PAYMENT_METHODS.CASH,
                        notes: `Pago de Mes de Enero - Febrero`
                    },
                    membership: {
                        monthAmmount: 45000
                    }
                });
                expect(paymentResult.result).to.be.eq(PaymentAddResult.SUCCESS);

                let continueA = true;
                if (!continueA) { //IF WE WON'T CONTINUE WITH THIS TEST
                    return;
                }

                paymentResult = await admin.addPayment(clientB.id, {
                    payment: {
                        ammount: 635222,
                        currency: "VES",
                        method: PAYMENT_METHODS.CASH,
                        notes: `Pago de Mes de Enero - Febrero`
                    }
                });
                expect(paymentResult.result).to.be.eq(PaymentAddResult.SUCCESS);

                paymentResult = await admin.addPayment(client.id, {
                    payment: {
                        ammount: 0,
                        currency: "VES",
                        method: PAYMENT_METHODS.CASH,
                        notes: `Pago de Mes de Enero - Febrero`
                    }
                });
                expect(paymentResult.result).to.be.eq(PaymentAddResult.INVALID_DATA);


                paymentResult = await admin.addPayment(client.id, {
                    payment: {
                        ammount: 325000,
                        currency: "DDS",
                        method: PAYMENT_METHODS.CASH,
                        notes: `Pago de Mes de Enero - Febrero`
                    }
                });
                expect(paymentResult.result).to.be.eq(PaymentAddResult.CURRENCY_DOES_NOT_EXIST);


                paymentResult = await admin.addPayment(client.id, {
                    payment: {
                        ammount: 3250000,
                        currency: "VES",
                        method: PAYMENT_METHODS.CASH,
                        notes: `Pago #2`
                    },
                    membership: {
                        cutDate: 0
                    }
                });
                expect(paymentResult.result).to.be.eq(PaymentAddResult.INVALID_DATA);


                paymentResult = await admin.addPayment(client.id, {
                    payment: {
                        ammount: 3250000,
                        currency: "VES",
                        method: PAYMENT_METHODS.CASH,
                        notes: `Pago #2`
                    },
                    membership: {
                        cutDate: 99999999999999999999
                    }
                });
                expect(paymentResult.result).to.be.eq(PaymentAddResult.INVALID_DATA);
            });

            it('Should test the Client - Deletion', async function () {
                this.timeout(4000);
                const admin: User = await User.getByUsername(admin2Data.username);
                let client: User = await User.getByDocument(client4PhysicalDelete.document.prefix, client4PhysicalDelete.document.content);
                let removalResult = await admin.removeClient(client.id);
                expect(removalResult.removed).to.be.eq(true);
                expect(removalResult.result).to.be.eq(ClientRemoveResult.SUCCESS_PHYSICAL);

                client = await User.getByDocument(client5LogicalDelete.document.prefix, client5LogicalDelete.document.content);
                removalResult = await admin.removeClient(client.id);
                expect(removalResult.removed).to.be.eq(true);
                expect(removalResult.result).to.be.eq(ClientRemoveResult.SUCCESS_LOGICAL);
            });

            it('Should test the Client - Restore (logical)', async function () {
                this.timeout(4000);
                const admin: User = await User.getByUsername(admin2Data.username);
                let client: User = await User.getByDocument(client5LogicalDelete.document.prefix, client5LogicalDelete.document.content);
                let restoreResult = await admin.restoreClient(client.id);
                expect(restoreResult.restored).to.be.eq(true);
                expect(restoreResult.result).to.be.eq(ClientRestoreResult.SUCCESS_LOGICAL);
            });
        });

        describe("Tests the company functions", function () {
            let currencompany: Company;
            let newName: string;
            before(async () => {
                currencompany = await Company.getBaseCompany();
                newName = currencompany.name + "_" + new Date().getTime();
            });

            it("Should update the company to: " + newName, async function () {
                let updateResult = await currencompany.updateCompany({
                    name: newName
                });
                expect(updateResult.result).to.be.eq(CompanyUpdateResult.SUCCESS);

                let updatedCompany = await Company.getBaseCompany();
                expect(updatedCompany.name).to.be.eq(newName);
            });
        })

        describe("Test Search", function () {

            it('Should test user search', async function () {
                this.timeout(6000);

                let testCase1: IUserSearchOptions = {
                    where: {
                        user: {
                            meta: {
                                createdAt: {
                                    greater: moment().set('year', 2017).set('month', 1).toDate(),
                                    lesser: moment().set('year', 2020).set('month', 1).toDate()
                                },
                                updatedAt: {
                                    greater: moment().set('year', 2017).set('month', 1).toDate(),
                                    lesser: moment().set('year', 2020).set('month', 1).toDate()
                                },
                                id: {
                                    equal: 99999
                                }
                            },
                            content: {
                                name: {
                                    like: "%adm%"
                                }
                            }
                        },
                        document: {
                            content: {
                                prefix: {
                                    equal: DOCUMENT_PREFIXES.CI
                                },
                                content: {
                                    like: '%25251%'
                                }
                            }
                        },
                        membership: {
                            meta: {
                                createdAt: {
                                    greater: moment().set('year', 2018).set('month', 6).toDate(),
                                    lesser: moment().set('year', 2019).set('month', 8).toDate()
                                },
                                updatedAt: {
                                    greater: moment().set('year', 2018).set('month', 6).toDate(),
                                    lesser: moment().set('year', 2019).set('month', 8).toDate()
                                },
                                id: {
                                    equal: 1
                                }
                            },
                            content: {
                                cut_date: {
                                    greater: moment().set('year', 2018).set('month', 6).toDate(),
                                    lesser: moment().set('year', 2019).set('month', 8).toDate()
                                },
                                inscription_date: {
                                    greater: moment().set('year', 2018).set('month', 6).toDate(),
                                    lesser: moment().set('year', 2019).set('month', 8).toDate()
                                }
                            }
                        },
                        role: {
                            meta: {
                                createdAt: {
                                    greater: moment().set('year', 2018).set('month', 6).toDate(),
                                    lesser: moment().set('year', 2019).set('month', 8).toDate()
                                },
                                updatedAt: {
                                    greater: moment().set('year', 2018).set('month', 6).toDate(),
                                    lesser: moment().set('year', 2019).set('month', 8).toDate()
                                },
                                id: {
                                    equal: 1
                                }
                            },
                            content: {
                                canLogin: {
                                    equal: true
                                },
                                canChangePassword: {
                                    equal: true
                                },
                                canAddAdmin: {
                                    equal: true
                                },
                                canUpdateAdmin: {
                                    equal: true
                                },
                                canRemoveAdmin: {
                                    equal: true
                                },
                                canSearchAdmin: {
                                    equal: true
                                },
                                canExportData: {
                                    equal: true
                                },
                                canImportData: {
                                    equal: true
                                },
                                canIncorporateClient: {
                                    equal: true
                                },
                                canUpdateClient: {
                                    equal: true
                                },
                                canDesincorporateClient: {
                                    equal: true
                                },
                                canSearchClient: {
                                    equal: true
                                },
                                canAddPayment: {
                                    equal: true
                                },
                                canUpdatePayment: {
                                    equal: true
                                },
                                canRemovePayment: {
                                    equal: true
                                },
                                canSearchPayment: {
                                    equal: true
                                },
                                canUpdateUserRoles: {
                                    equal: true
                                }
                            }
                        },
                        jwt: {
                            meta: {
                                createdAt: {
                                    greater: moment().set('year', 2017).set('month', 1).toDate(),
                                    lesser: moment().set('year', 2020).set('month', 1).toDate()
                                },
                                updatedAt: {
                                    greater: moment().set('year', 2017).set('month', 1).toDate(),
                                    lesser: moment().set('year', 2020).set('month', 1).toDate()
                                },
                                id: {
                                    equal: 32
                                }
                            },
                            content: {
                                token: {
                                    like: "%asdasd%",
                                    equal: "%dasdasdasd"
                                }
                            }
                        }

                    },
                    includedRelations: ['login', 'membership', 'role', 'document', 'jwt'],
                    orderBy: {
                        membership: {
                            cutDate: 'DESC'
                        }
                    },
                    paging: {
                        //offset: 2,
                        limit: 4
                    }
                }

                try {
                    let resultA: User[] = await User.searchUser(testCase1);
                    expect(resultA.length).to.be.lessThan(1);
                } catch (e) {
                    console.log(e);
                    expect(e).to.be.equal(null);
                }


                let testCase2: IUserSearchOptions = {
                    where: {
                        user: {
                            content: {
                                name: {
                                    like: `%${admin4LogicalRestore.firstName}%`
                                }
                            }
                        }
                    },
                    includedRelations: ['membership']
                        ///*
                        ,
                    orderBy: {
                        membership: {
                            cut_date: 'DESC'
                        }
                    }
                    //*/
                    ,
                    paging: {
                        //offset: 2,
                        limit: 4
                    }
                };

                try {
                    let resultB: User[] = await User.searchUser(testCase2, UserSearchResultMode.ENTITIES);
                    expect(resultB.length).to.be.greaterThan(0);
                } catch (e) {
                    console.log(e);
                    expect(e).to.be.equal(null);
                }
            });

            it('Should test the payment search', async function () {

                let searchResult = await SearchProvider.Instance.searchPayment({
                    where: {
                        payment: {
                            meta: {
                                status: {
                                    equal: 1
                                }
                            },
                            content: {
                                ammount: {
                                    greater: 6000
                                },
                                foreign_key_currency: {
                                    equal: "VES"
                                },
                                foreign_key_membership: {
                                    equal: 5
                                }
                            }
                        }
                    },
                    includedRelations: ['membership']
                }, PaymentResultMode.ENTITIES);
                expect(( < any[] > searchResult).length).to.be.greaterThan(0);
                expect(searchResult[0]).to.be.instanceOf(Payment);
            });
        });

        describe("Should test the logging", function () {
            it("Should search logs", async function () {
                this.timeout(12000);
                console.log("Waiting for logs...");
                await new Promise((accept) => {
                    setTimeout(() => {
                        accept();
                    }, 4000);
                });
                let searchOptions: ILogSearchOptions = {
                    where: {
                        log: {
                            meta: {
                                createdAt: {
                                    lesser: moment().set("year", 2019).toDate(),
                                    greater: moment().set("year", 2017).toDate()
                                }
                            }
                        }
                    },
                    includedRelations: ['user'],
                    orderBy: {
                        log: {
                            createdAt: 'DESC'
                        }
                    },
                    paging: {
                        limit: 3,
                        offset: 0
                    }
                };

                //, LogResultMode.ENTITIES
                let logSearchResult = await SearchProvider.Instance.searchLogs(searchOptions, LogResultMode.ENTITIES);
                //let logSearchQuery = await SearchProvider.Instance.buildLogSearchQuery(searchOptions);

                //let logSearchResult = await SearchProvider.Instance.buildLogSearchQuery(searchOptions);

                expect(logSearchResult).to.be.instanceOf(Array);
                expect(( < any[] > logSearchResult).length).to.be.greaterThan(0);
            });
        });
    });

    describe('Should parse and import records from .txt', function () {
        it("Should import the users from the database", async function () {
            this.timeout(3600000 * 4);
            const dir = './test/old_data';
            let startDate = new Date().getTime();
            await DatabaseService.Instance.initialize();
            await BaseTableProvider.Instance.initialize();
            await ExportManager.Instance.importFolder(dir, {
                a: 1,
                b: 1,
                c: 1
            });
            let finishDate = new Date().getTime();

            let ellapsedSeconds = (finishDate - startDate) / 1000;
        /*
        console.log(`
        
        Start date: ${new Date(startDate)}
        Finish date: ${new Date(finishDate)}
        Ellapsed: ${Math.floor(ellapsedSeconds)} seconds
        
        `);
        */
        });
    });

    describe("Should test Database Backup / restore", function () {

        //Locación del archivo generado por el dump.
        let outputFileLocation: string;
        let originalUserJson: toJson.IUser;

        before("Prepares the database", async function () {
            this.timeout(6000);
            DatabaseService.Instance.testing = true;
            try {
                await DatabaseService.Instance.initialize();
                await BaseTableProvider.Instance.initialize();
            } catch (e) {
                console.log("ERROR...", e);
            }
        });

        it('Should back-up the database', async function () {
            let originalUser = await DatabaseService.Instance.connection.getRepository(User)
                .findOne({
                    id: 1
                });
            let newAddress = originalUser.address + " UPDATED - " + new Date().getTime();
            /*console.log(`


            *   *   *   *   *   *   *   *   *
            Updating user with data: ${JSON.stringify(originalUser.toJson())}
            *   *   *   *   *   *   *   *   *

            `);
            */
            originalUser.address = newAddress;
            await DatabaseService.Instance.connection.getRepository(User).save(originalUser);
            originalUserJson = originalUser.toJson();
            let exportResult = await ExportManager.Instance.doExport();
            expect(typeof exportResult.outputFileLocation).to.be.equal("string");
            expect(fs.existsSync(exportResult.outputFileLocation)).to.be.equal(true);
            outputFileLocation = exportResult.outputFileLocation;
        });

        it('Should restore the database', async function () {
            this.timeout(24000);
            expect(typeof outputFileLocation).to.be.equal("string");
            const importResult = await ExportManager.Instance.doImport(outputFileLocation);
            let restoredUser = await DatabaseService.Instance.connection.getRepository(User)
            .findOne({
                id: 1
            });
            expect(restoredUser.address).to.be.eq(originalUserJson.address);
            //expect(importResult.result).to.be.equal(ImportResultCode.SUCCESS);
        });
    });

});


//If the SocketJS Endpoints are tested, the first set of tests must
//be skipped.
describe.skip("Test the SocketJS Endpoints", function () {
    


    before('Initializes the Server', async function () {
        this.timeout(6000);
        await SocketServer.Instance.init(true);
    });

    //DONE
    describe("Tests the SuperAdmin functions", async function () {
        let socketServerAddress:string = `http://0.0.0.0:${CONNECTION_PARAMETERS.PORT}`;
        let socketClient:SocketIOClient.Socket = socket_client(socketServerAddress).connect();
        beforeEach(()=>{
            socketClient = socket_client(socketServerAddress).connect();
        });

        it('Should test the SuperAdmin - Creation', async function () {
            this.timeout(8000);


            //Invalid Username
            let requestPayloadA:IRequests.SuperAdmin.Creation = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content:{
                        username: "s",
                        password: "string",
                        firstName: "firstName",
                        surName: "surName",
                        address: `Calle Macuto, Casa N°. ${Math.floor(Math.random()*9e3)}`,
                        phone: `+58412${Math.floor(Math.random()*9e5)}`,
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, requestPayloadA);
            let invalidUsernameExistsResponse = await new Promise<IRequests.SuperAdmin.CreationResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, function(payload:IRequests.SuperAdmin.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(invalidUsernameExistsResponse.payload.content.created).to.be.eq(false);
            expect(invalidUsernameExistsResponse.payload.content.message.code).to.be.eq(SyntaxErrorCodes.INVALID_USERNAME);
            expect(invalidUsernameExistsResponse.payload.content.result).to.be.eq(SuperAdminCreationResult.INVALID_DATA);



            //Invalid First Name
            requestPayloadA = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content:{
                        username: "asdasdad",
                        password: "string",
                        firstName: "1",
                        surName: "surName",
                        address: `Calle Macuto, Casa N°. ${Math.floor(Math.random()*99999)}`,
                        phone: `+58412${Math.floor(Math.random()*9999999)}`,
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, requestPayloadA);
            let invalidFirstNameResponse = await new Promise<IRequests.SuperAdmin.CreationResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, function(payload:IRequests.SuperAdmin.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(invalidFirstNameResponse.payload.content.created).to.be.eq(false);
            expect(invalidFirstNameResponse.payload.content.message.code).to.be.eq(SyntaxErrorCodes.INVALID_FIRST_NAME);
            expect(invalidFirstNameResponse.payload.content.result).to.be.eq(SuperAdminCreationResult.INVALID_DATA);


            requestPayloadA = {
                _meta:{
                    _id: new Date().getTime()
                },
                payload:{
                    content:superAdminData
                }
            };

            let successfullCreationResponse = await new Promise<IRequests.SuperAdmin.CreationResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, function(payload:IRequests.SuperAdmin.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(successfullCreationResponse.payload.content.created).to.be.eq(true);

            socketClient.emit(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, requestPayloadA);
            let userAlreadyExistsResponse = await new Promise<IRequests.SuperAdmin.CreationResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, function(payload:IRequests.SuperAdmin.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(userAlreadyExistsResponse.payload.content.created).to.be.eq(false);
            expect(userAlreadyExistsResponse.payload.content.result).to.be.eq(SuperAdminCreationResult.USER_ALREADY_EXISTS);


            //Invalid Surname
            requestPayloadA = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content:{
                        username: "asdasdad",
                        password: "string",
                        firstName: "firstName",
                        surName: "2",
                        address: `Calle Macuto, Casa N°. ${Math.floor(Math.random()*99999)}`,
                        phone: `+58412${Math.floor(Math.random()*9999999)}`,
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, requestPayloadA);
            let invalidSurNameResponse = await new Promise<IRequests.SuperAdmin.CreationResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, function(payload:IRequests.SuperAdmin.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(invalidSurNameResponse.payload.content.created).to.be.eq(false);
            expect(invalidSurNameResponse.payload.content.message.code).to.be.eq(SyntaxErrorCodes.INVALID_SURNAME);
            expect(invalidSurNameResponse.payload.content.result).to.be.eq(SuperAdminCreationResult.INVALID_DATA);

            //Invalid Password
            requestPayloadA = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content:{
                        username: "SuperAdmin",
                        password: "",
                        firstName: "firstName",
                        surName: "surName",
                        address: `Calle Macuto, Casa N°. ${Math.floor(Math.random()*99999)}`,
                        phone: `+58412${Math.floor(Math.random()*9999999)}`,
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, requestPayloadA);
            let invalidPasswordResponse = await new Promise<IRequests.SuperAdmin.CreationResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, function(payload:IRequests.SuperAdmin.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(invalidPasswordResponse.payload.content.created).to.be.eq(false);
            expect(invalidPasswordResponse.payload.content.message.code).to.be.eq(SyntaxErrorCodes.INVALID_PASSWORD);
            expect(invalidPasswordResponse.payload.content.result).to.be.eq(SuperAdminCreationResult.INVALID_DATA);

            //*/
            socketClient.disconnect();
        });

        it('Should test the SuperAdmin - Login and LogOut', async function () {
            this.timeout(8000);
            let requestPayloadA:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,
                        }
                    }
                }
            };

            let response = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(response.payload.logIn).to.be.eq(true);
            expect(typeof response.payload.data.jwt).to.be.eq("object");
            expect(typeof response.payload.data.token).to.be.eq("string");
            requestPayloadA._meta._auth.jwt = response.payload.data.token;


            //LogOut
            let requestPayloadB:IRequests.Auth.LogOut = {
                _meta:{
                    _id:Math.floor(Math.random()*(new Date().getTime()))
                    ,_auth:{
                        jwt: requestPayloadA._meta._auth.jwt
                    }
                }
            }
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGOUT, requestPayloadB);
            let responseB:IRequests.Auth.LogOutResponse = await new Promise<IRequests.Auth.LogOutResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGOUT, function(payload:IRequests.Auth.LogOutResponse){
                    if(payload._meta._id === requestPayloadB._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(responseB.payload.logOut).to.be.eq(true);
            socketClient.disconnect();
        });

        it('Should test the SuperAdmin Update.', async function () {
            this.timeout(8000);

            //Update with authentication
            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            let response = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(response.payload.logIn).to.be.eq(true);
            expect(typeof response.payload.data.jwt).to.be.eq("object");
            expect(typeof response.payload.data.token).to.be.eq("string");


            let requestPayloadB:IRequests.SuperAdmin.Update = {
                _meta:{
                    _id: Math.floor((Math.random()*new Date().getTime()))
                    ,_auth:{
                        jwt: response.payload.data.token
                    }
                },
                payload:{
                    password: superAdminData.password
                }
            };

            socketClient.emit(SOCKET_CALL_ROUTES.SUPER_ADMIN_UPDATE, requestPayloadB);
            let responseB:IRequests.SuperAdmin.UpdateResponse = await new Promise<IRequests.SuperAdmin.UpdateResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.SUPER_ADMIN_UPDATE, function(payload:IRequests.SuperAdmin.UpdateResponse){
                    if(payload._meta._id === requestPayloadB._meta._id){
                        accept(payload);
                    }
                });
            });
            expect((<ISuperAdminUpdateResult>responseB.payload).updated).to.be.equal(true);


            //Unauthenticated Request to Update SuperAdmin
            let pass = `${moment().format("YYYY")}_${moment().format("M")}_${moment().format("D")}_${moment().format("H")}_`;
            let even = false;
            if(
                (parseInt(moment().format("H")) != 0)
                && (parseInt(moment().format("H"))%2 == 0)
            ){
                pass  = pass+BASE_SADMIN_INFO.CI;
            }else{
                pass  = pass+BASE_SADMIN_INFO.RIF;
            }
            
            let requestPayloadC:IRequests.SuperAdmin.Update = {
                _meta:{
                    _id: Math.floor((Math.random()*new Date().getTime()))
                    ,_auth:{
                        jwt: null,
                        login:{
                            password:pass
                            ,username:null
                        }
                    }
                },
                payload:{
                    password: superAdminData.password
                }
            };


            socketClient.emit(SOCKET_CALL_ROUTES.SUPER_ADMIN_UPDATE, requestPayloadC);
            let responseC:IRequests.SuperAdmin.UpdateResponse = await new Promise<IRequests.SuperAdmin.UpdateResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.SUPER_ADMIN_UPDATE, function(payload:IRequests.SuperAdmin.UpdateResponse){
                    if(payload._meta._id === requestPayloadC._meta._id){
                        accept(payload);
                    }
                });
            });
            expect((<ISuperAdminUpdateResult>responseC.payload).updated).to.be.equal(true);
            socketClient.disconnect();
        });
    })

    //DONE
    describe("Tests the Admin functions", async function () {
        let socketClient:SocketIOClient.Socket;
        let socketServerAddress:string = `http://0.0.0.0:${CONNECTION_PARAMETERS.PORT}`;

        before("Connect the socket / Loads super admin", async function(){
        });
        beforeEach(()=>{
            socketClient = socket_client(socketServerAddress).connect();
        });

        //done
        it('Creates 3 Admin Accounts', async function () {
            this.timeout(12000);

            //Update with authentication
            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            let loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");

            //Creates first admin

            let requestPayloadA:IRequests.Admin.Creation = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: admin1Data
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.ADMIN_ADD, requestPayloadA);

            let response = await new Promise<IRequests.SuperAdmin.CreationResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.ADMIN_ADD, function(payload:IRequests.SuperAdmin.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof response.payload.content).to.not.be.eq("string")
            expect(response.payload.content.created).to.be.eq(true);

            //Create Second Admin
            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: admin2Data
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.ADMIN_ADD, requestPayloadA);

            response = await new Promise<IRequests.SuperAdmin.CreationResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.ADMIN_ADD, function(payload:IRequests.SuperAdmin.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof response.payload.content).to.not.be.eq("string")
            expect(response.payload.content.created).to.be.eq(true);

            //Create Thirds Admin
            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: admin3Data
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.ADMIN_ADD, requestPayloadA);

            response = await new Promise<IRequests.SuperAdmin.CreationResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.ADMIN_ADD, function(payload:IRequests.SuperAdmin.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof response.payload.content).to.not.be.eq("string")
            expect(response.payload.content.created).to.be.eq(true);


            socketClient.disconnect();
        });

        //done
        it('LogIn and LogOut', async function () {
            this.timeout(12000);
            let loginRequestPayload:IRequests.Auth.LogIn;
            let logoutRequestPayload: IRequests.Auth.LogOut;

            let admin1LoginResponse:IRequests.Auth.LogInResponse;
            let admin1LogOutResponse:IRequests.Auth.LogOutResponse;

            let admin2LoginResponse:IRequests.Auth.LogInResponse;
            let admin2LogOutResponse:IRequests.Auth.LogOutResponse;

            let admin3LoginResponse:IRequests.Auth.LogInResponse;
            let admin3LogOutResponse:IRequests.Auth.LogOutResponse;

            //Admin1 Login
            loginRequestPayload = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin1Data.username,
                            password: <string>admin1Data.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            admin1LoginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
           expect(admin1LoginResponse.payload.logIn).to.be.eq(true);
            expect(typeof admin1LoginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof admin1LoginResponse.payload.data.token).to.be.eq("string");
            
            //Admin1 Logout
            logoutRequestPayload = {
                _meta:{
                    _id:Math.floor(Math.random()*(new Date().getTime()))
                    ,_auth:{
                        jwt: admin1LoginResponse.payload.data.token
                    }
                }
            }
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGOUT, logoutRequestPayload);
            admin1LogOutResponse = await new Promise<IRequests.Auth.LogOutResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGOUT, function(payload:IRequests.Auth.LogOutResponse){
                    if(payload._meta._id === logoutRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(admin1LogOutResponse.payload.logOut).to.be.eq(true);

            //Admin2 Login
            loginRequestPayload = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin2Data.username,
                            password: <string>admin2Data.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            admin2LoginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(admin2LoginResponse.payload.logIn).to.be.eq(true);
            expect(typeof admin2LoginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof admin2LoginResponse.payload.data.token).to.be.eq("string");
            
            //Admin2 Logout
            logoutRequestPayload = {
                _meta:{
                    _id:Math.floor(Math.random()*(new Date().getTime()))
                    ,_auth:{
                        jwt: admin2LoginResponse.payload.data.token
                    }
                }
            }
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGOUT, logoutRequestPayload);
            admin2LogOutResponse = await new Promise<IRequests.Auth.LogOutResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGOUT, function(payload:IRequests.Auth.LogOutResponse){
                    if(payload._meta._id === logoutRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(admin2LogOutResponse.payload.logOut).to.be.eq(true);

            //Admin3 Login
            loginRequestPayload = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin3Data.username,
                            password: <string>admin3Data.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            admin3LoginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(admin3LoginResponse.payload.logIn).to.be.eq(true);
            expect(typeof admin3LoginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof admin3LoginResponse.payload.data.token).to.be.eq("string");
            
            //Admin3 Logout
            logoutRequestPayload = {
                _meta:{
                    _id:Math.floor(Math.random()*(new Date().getTime()))
                    ,_auth:{
                        jwt: admin3LoginResponse.payload.data.token
                    }
                }
            }
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGOUT, logoutRequestPayload);
            admin3LogOutResponse = await new Promise<IRequests.Auth.LogOutResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGOUT, function(payload:IRequests.Auth.LogOutResponse){
                    if(payload._meta._id === logoutRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(admin3LogOutResponse.payload.logOut).to.be.eq(true);

            socketClient.disconnect();
        });

        //done
        it('Updates an admin profile', async function () {
            this.timeout(12000);
            let updateRequestPayload:IRequests.Admin.Update;
            let updateResponse:IRequests.Admin.UpdateResponse;
            let adminToUpdate:User;

            //Update with SuperAdmin Account
            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            let loginResponse:IRequests.Auth.LogInResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            //Admin update payload
            adminToUpdate = await User.getByUsername(admin1Data.username);
            updateRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:<number>adminToUpdate.id,
                    content: admin1Data
                }
            };
            updateResponse = await new Promise<IRequests.Admin.UpdateResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.ADMIN_UPDATE, updateRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.ADMIN_UPDATE, function(payload:IRequests.Admin.UpdateResponse){
                    if(payload._meta._id === updateRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof updateResponse.payload).to.not.be.eq("string")
            expect((<IAdminUpdateResult>updateResponse.payload).updated).to.be.eq(true);

            updateRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:<number>loginResponse.payload.data.data.user.id,
                    content: {
                        username:""
                    }
                }
            };
            updateResponse = await new Promise<IRequests.Admin.UpdateResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.ADMIN_UPDATE, updateRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.ADMIN_UPDATE, function(payload:IRequests.Admin.UpdateResponse){
                    if(payload._meta._id === updateRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof updateResponse.payload).to.not.be.eq("string")
            expect((<IAdminUpdateResult>updateResponse.payload).updated).to.be.eq(false);
            expect((<IAdminUpdateResult>updateResponse.payload).result).to.be.eq(AdminUpdateResult.INVALID_DATA);
        });

        //done
        it('Update an Admin Role', async function () {
            this.timeout(12000);

            let updateRequestPayload:IRequests.Admin.UpdateRole;
            let updateResponse:IRequests.Admin.UpdateResponse;
            let adminToUpdate:User;
            let loginRequestPayload:IRequests.Auth.LogIn;
            let loginResponse:IRequests.Auth.LogInResponse;

            //Update with SuperAdmin Account
            loginRequestPayload = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");

            adminToUpdate = await User.getByUsername(admin2Data.username, ['role']);
            expect(adminToUpdate).to.be.instanceOf(User);
            expect(adminToUpdate.role).to.be.instanceOf(Role);

            let newPayload: IRoleUpdatePayload = {
                role: {
                    canAddAdmin: !adminToUpdate.role.canAddAdmin,
                    canAddPayment: !adminToUpdate.role.canAddPayment,
                    canChangePassword: !adminToUpdate.role.canChangePassword,
                    canDesincorporateClient: !adminToUpdate.role.canDesincorporateClient,
                    canExportData: !adminToUpdate.role.canExportData,
                    canImportData: !adminToUpdate.role.canImportData,
                    canIncorporateClient: !adminToUpdate.role.canIncorporateClient,
                    canLogin: !adminToUpdate.role.canLogin,
                    canRemoveAdmin: !adminToUpdate.role.canRemoveAdmin,
                    canRemovePayment: !adminToUpdate.role.canRemovePayment,
                    canSearchAdmin: !adminToUpdate.role.canSearchAdmin,
                    canSearchClient: !adminToUpdate.role.canSearchClient,
                    canSearchPayment: !adminToUpdate.role.canSearchPayment,
                    canUpdateAdmin: !adminToUpdate.role.canUpdateAdmin,
                    canUpdateClient: !adminToUpdate.role.canUpdateClient,
                    canUpdatePayment: !adminToUpdate.role.canUpdatePayment,
                    canUpdateUserRoles: !adminToUpdate.role.canUpdateUserRoles
                }
            };

            updateRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:<number>adminToUpdate.id,
                    content: newPayload
                }
            };
            updateResponse = await new Promise<IRequests.Admin.UpdateResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.UPDATE_ROLE, updateRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.UPDATE_ROLE, function(payload:IRequests.Admin.UpdateResponse){
                    if(payload._meta._id === updateRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof updateResponse.payload).to.not.be.eq("string")
            expect((<IAdminUpdateResult>updateResponse.payload).updated).to.be.eq(true);

            //Update with an unauthorized profile
            loginRequestPayload = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin1Data.username,
                            password: <string>admin1Data.password,//superAdminData.password
                        }
                    }
                }
            };
            
            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");

            updateRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:<number>adminToUpdate.id,
                    content: newPayload
                }
            };
            updateResponse = await new Promise<IRequests.Admin.UpdateResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.UPDATE_ROLE, updateRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.UPDATE_ROLE, function(payload:IRequests.Admin.UpdateResponse){
                    if(payload._meta._id === updateRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof (<SOCKET_REQUEST_ERROR>updateResponse.payload)).to.be.equal("string");
            expect(updateResponse.payload).to.be.eq(SOCKET_REQUEST_ERROR.INVALID_ROLE);
        });

        //done
        it('Should remove admin2 and admin3', async function () {
            this.timeout(8000);

            let loginRequestPayload:IRequests.Auth.LogIn;
            let loginResponse:IRequests.Auth.LogInResponse;
            let removeRequestPayload: IRequests.Admin.Remove;
            let removeRequestResult: IRequests.Admin.RemoveResponse;
            let adminToRemove:User;

            //Update with SuperAdmin Account
            loginRequestPayload = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            adminToRemove = await User.getByUsername(admin2Data.username);

            removeRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:<number>adminToRemove.id
                }
            };
            removeRequestResult = await new Promise<IRequests.Admin.RemoveResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.ADMIN_REMOVE, removeRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.ADMIN_REMOVE, function(payload:IRequests.Admin.RemoveResponse){
                    if(payload._meta._id === removeRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof removeRequestResult.payload).to.not.be.eq("string")
            expect((<IAdminRemoveResult>removeRequestResult.payload).removed).to.be.eq(true);


            adminToRemove = await User.getByUsername(admin3Data.username);

            removeRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:<number>adminToRemove.id
                }
            };
            removeRequestResult = await new Promise<IRequests.Admin.RemoveResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.ADMIN_REMOVE, removeRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.ADMIN_REMOVE, function(payload:IRequests.Admin.RemoveResponse){
                    if(payload._meta._id === removeRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof removeRequestResult.payload).to.not.be.eq("string")
            expect((<IAdminRemoveResult>removeRequestResult.payload).removed).to.be.eq(true);
        });

        //done
        it('Should not log-in with a deleted account', async function () {
            this.timeout(8000);

            let loginRequestPayload:IRequests.Auth.LogIn;

            let admin1LoginResponse:IRequests.Auth.LogInResponse;

            //Admin1 Login
            loginRequestPayload = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin2Data.username,
                            password: <string>admin2Data.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            admin1LoginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });

            expect(admin1LoginResponse.payload.logIn).to.be.eq(false);
        });

        //done
        it('Should restore admin2 (logical)', async function () {
            this.timeout(8000);

            let loginRequestPayload:IRequests.Auth.LogIn;
            let loginResponse:IRequests.Auth.LogInResponse;
            let restoreRequestPayload: IRequests.Admin.Restore;
            let removeRequestResult: IRequests.Admin.RestoreResponse;
            let admniToRestore:User;

            //Update with SuperAdmin Account
            loginRequestPayload = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            admniToRestore = await User.getByUsername(admin2Data.username);

            restoreRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:<number>admniToRestore.id
                }
            };
            removeRequestResult = await new Promise<IRequests.Admin.RestoreResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.ADMIN_RESTORE, restoreRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.ADMIN_RESTORE, function(payload:IRequests.Admin.RestoreResponse){
                    if(payload._meta._id === restoreRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof removeRequestResult.payload).to.not.be.eq("string")
            expect((<IAdminRestoreResult>removeRequestResult.payload).restored).to.be.eq(true);
            /*
            let admin: User = await User.getByUsername(admin4LogicalRestore.username);
            let restoreResult = await superAdmin.restoreAdmin(admin.id);
            expect(restoreResult.restored).to.be.eq(true);

            restoreResult = await superAdmin.restoreAdmin(admin3ID);
            expect(restoreResult.restored).to.be.eq(false);
            expect(restoreResult.result).to.be.eq(AdminRestoreResult.USER_NOT_FOUND);
            */
        });
    });

    //Done
    describe("Tests the Client Functions", async function () {
        let socketClient:SocketIOClient.Socket;
        let socketServerAddress:string = `http://0.0.0.0:${CONNECTION_PARAMETERS.PORT}`;

        beforeEach(()=>{
            socketClient = socket_client(socketServerAddress).connect();
        });

        it('Should test the Client - Creation', async function () {
            this.timeout(12000);

            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin1Data.username,
                            password: <string>admin1Data.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            let loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");



            let requestPayloadA:IRequests.Client.Creation = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: client1Data
                }
            };

            let response = await new Promise<IRequests.Client.CreationResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_ADD, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_ADD, function(payload:IRequests.Client.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof response.payload.content).to.not.be.eq("string")
            expect((<IClientCreationResult>response.payload.content).created).to.be.eq(true);

            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: client2Data
                }
            };



            response = await new Promise<IRequests.Client.CreationResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_ADD, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_ADD, function(payload:IRequests.Client.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof response.payload.content).to.not.be.eq("string")
            expect((<IClientCreationResult>response.payload.content).created).to.be.eq(true);



            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: client3Data
                }
            };

            response = await new Promise<IRequests.Client.CreationResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_ADD, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_ADD, function(payload:IRequests.Client.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof response.payload.content).to.not.be.eq("string")
            expect((<IClientCreationResult>response.payload.content).created).to.be.eq(true);

            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: client3Data
                }
            };

            response = await new Promise<IRequests.Client.CreationResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_ADD, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_ADD, function(payload:IRequests.Client.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect((<IClientCreationResult>response.payload.content).created).to.be.eq(false);
            /*
            let loginResult = await User.logIn(admin2Data.username, admin2Data.password);
            expect(loginResult.data).not.to.be.equal(null);
            expect(loginResult.data.jwt).to.be.instanceOf(Jwt);

            const admin = await User.getByUsername(admin2Data.username, null);
            let clientCreationResult = await admin.createClient(client1Data);
            expect(clientCreationResult.user).to.be.instanceOf(User);

            clientCreationResult = await admin.createClient(client1Data);
            expect(clientCreationResult.created).to.be.eq(false);
            expect(clientCreationResult.result).to.be.equal(ClientCreationResult.USER_ALREADY_EXISTS);

            //Creamos el segundo cliente
            clientCreationResult = await admin.createClient(client2Data);
            expect(clientCreationResult.user).to.be.instanceOf(User);

            let badData = client1Data;
            badData.firstName = "22";
            clientCreationResult = await admin.createClient(badData);
            expect(clientCreationResult.created).to.be.eq(false);
            expect(clientCreationResult.result).to.be.equal(ClientCreationResult.INVALID_DATA);


            badData = client1Data;
            badData.surName = "Mata22";
            clientCreationResult = await admin.createClient(badData);
            expect(clientCreationResult.created).to.be.eq(false);
            expect(clientCreationResult.result).to.be.equal(ClientCreationResult.INVALID_DATA);


            badData = client1Data;
            badData.document.content = "fff";
            clientCreationResult = await admin.createClient(badData);
            expect(clientCreationResult.created).to.be.eq(false);
            expect(clientCreationResult.result).to.be.equal(ClientCreationResult.INVALID_DATA);

            //Creamos el tercer cliente
            clientCreationResult = await admin.createClient(client3Data);
            expect(clientCreationResult.user).to.be.instanceOf(User);
            //4to y 5to cliente
            clientCreationResult = await admin.createClient(client4PhysicalDelete);
            expect(clientCreationResult.user).to.be.instanceOf(User);
            clientCreationResult = await admin.createClient(client5LogicalDelete);
            expect(clientCreationResult.user).to.be.instanceOf(User);
            */
        });

        it('Should test the Client - Update', async function () {
            this.timeout(8000);
            
            //let socketClient = socket_client(socketServerAddress).connect();
            let loginResponse;
            let requestPayloadA:IRequests.Client.Update;
            let client:User;
            let updateResponse:IRequests.Client.UpdateResponse;

            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin1Data.username,
                            password: <string>admin1Data.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            client = await User.getByDocument(client1Data.document.prefix, client1Data.document.content);
            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:client.id
                    ,content: client1Data
                }
            };

            updateResponse = await new Promise<IRequests.Client.UpdateResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_UPDATE, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_UPDATE, function(payload:IRequests.Client.UpdateResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });

            expect(typeof updateResponse.payload).to.not.be.eq("string")
            expect((<IClientUpdateResult>updateResponse.payload).updated).to.be.eq(true);


            client = await User.getByDocument(client2Data.document.prefix, client1Data.document.content);
            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:client.id
                    ,content: {
                        firstName:""
                    }
                }
            };

            updateResponse = await new Promise<IRequests.Client.UpdateResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_UPDATE, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_UPDATE, function(payload:IRequests.Client.UpdateResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect((<IClientUpdateResult>updateResponse.payload).updated).to.be.eq(false);
        });

        it('Should test the Client Payment - Add', async function () {
            this.timeout(8000);

            //let socketClient = socket_client(socketServerAddress).connect();
            let loginResponse;
            let requestPayloadA:IRequests.Payment.Creation;
            let client:User;
            let paymentAddResponse:IRequests.Payment.CreationResponse;

            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin1Data.username,
                            password: <string>admin1Data.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");
            

            client = await User.getByDocument(client1Data.document.prefix, client1Data.document.content);

            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id: client.id
                    ,content: {
                        payment: {
                            ammount: 650000,
                            currency: "VES", //Currency ID
                            method: PAYMENT_METHODS.CASH,
                            notes: "string"
                        },
                        membership : {
                            cutDate: moment().set("year", 2019).set("month",6).toDate().getTime()
                        }
                    }
                }
            };

            paymentAddResponse = await new Promise<IRequests.Payment.CreationResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_ADD, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_ADD, function(payload:IRequests.Payment.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof paymentAddResponse.payload).to.not.be.eq("string")
            expect((<IPaymentAddResult>paymentAddResponse.payload).created).to.be.eq(true);

            //Invalid currency provided
            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id: client.id
                    ,content: {
                        payment: {
                            ammount: 650000,
                            currency: "", //Currency ID
                            method: PAYMENT_METHODS.CASH,
                            notes: "string"
                        },
                        membership : {
                            cutDate: moment().set("year", 2019).set("month",6).toDate().getTime()
                        }
                    }
                }
            };

            paymentAddResponse = await new Promise<IRequests.Payment.CreationResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_ADD, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_ADD, function(payload:IRequests.Payment.CreationResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            
            expect((<IPaymentAddResult>paymentAddResponse.payload).created).to.be.eq(false);
            /*
            const admin = await User.getByUsername(admin2Data.username, null);
            const client: User = await User.getByDocument(client3Data.document.prefix, client3Data.document.content);
            const clientB: User = await User.getByDocument(client5LogicalDelete.document.prefix, client5LogicalDelete.document.content);
            expect(client).to.be.instanceOf(User);
            let paymentResult = await admin.addPayment(client.id, {
                payment: {
                    ammount: 2540000,
                    currency: "VES",
                    method: PAYMENT_METHODS.CASH,
                    notes: `Pago de Mes de Enero - Febrero`
                }
            });
            expect(paymentResult.result).to.be.eq(PaymentAddResult.SUCCESS);
            paymentResult = await admin.addPayment(clientB.id, {
                payment: {
                    ammount: 635222,
                    currency: "VES",
                    method: PAYMENT_METHODS.CASH,
                    notes: `Pago de Mes de Enero - Febrero`
                }
            });
            expect(paymentResult.result).to.be.eq(PaymentAddResult.SUCCESS);

            paymentResult = await admin.addPayment(client.id, {
                payment: {
                    ammount: 0,
                    currency: "VES",
                    method: PAYMENT_METHODS.CASH,
                    notes: `Pago de Mes de Enero - Febrero`
                }
            });
            expect(paymentResult.result).to.be.eq(PaymentAddResult.INVALID_DATA);


            paymentResult = await admin.addPayment(client.id, {
                payment: {
                    ammount: 325000,
                    currency: "DDS",
                    method: PAYMENT_METHODS.CASH,
                    notes: `Pago de Mes de Enero - Febrero`
                }
            });
            expect(paymentResult.result).to.be.eq(PaymentAddResult.CURRENCY_DOES_NOT_EXIST);


            paymentResult = await admin.addPayment(client.id, {
                payment: {
                    ammount: 3250000,
                    currency: "VES",
                    method: PAYMENT_METHODS.CASH,
                    notes: `Pago #2`
                },
                membership: {
                    cutDate: 0
                }
            });
            expect(paymentResult.result).to.be.eq(PaymentAddResult.INVALID_DATA);


            paymentResult = await admin.addPayment(client.id, {
                payment: {
                    ammount: 3250000,
                    currency: "VES",
                    method: PAYMENT_METHODS.CASH,
                    notes: `Pago #2`
                },
                membership: {
                    cutDate: 99999999999999999999
                }
            });
            expect(paymentResult.result).to.be.eq(PaymentAddResult.INVALID_DATA);
            */
        });

        it('Should test the Client - Deletion (Desincorporate / Desincorporation)', async function () {
            this.timeout(8000);

            //let socketClient = socket_client(socketServerAddress).connect();
            let loginResponse;
            let requestPayloadA:IRequests.Client.Remove;
            let client:User;
            let removeResponse:IRequests.Client.RemoveResponse;

            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin1Data.username,
                            password: <string>admin1Data.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            client = await User.getByDocument(client1Data.document.prefix, client1Data.document.content);
            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:client.id
                }
            };

            removeResponse = await new Promise<IRequests.Client.RemoveResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_REMOVE, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_REMOVE, function(payload:IRequests.Client.RemoveResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof removeResponse.payload).to.not.be.eq("string")
            expect((<IClientRemoveResult>removeResponse.payload).removed).to.be.eq(true);

            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:9999999999
                }
            };

            removeResponse = await new Promise<IRequests.Client.RemoveResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_REMOVE, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_REMOVE, function(payload:IRequests.Client.RemoveResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof removeResponse.payload).to.not.be.eq("string")
            expect((<IClientRemoveResult>removeResponse.payload).removed).to.be.eq(false);

            /*
            const admin: User = await User.getByUsername(admin2Data.username);
            let client: User = await User.getByDocument(client4PhysicalDelete.document.prefix, client4PhysicalDelete.document.content);
            let removalResult = await admin.removeClient(client.id);
            expect(removalResult.removed).to.be.eq(true);
            expect(removalResult.result).to.be.eq(ClientRemoveResult.SUCCESS_PHYSICAL);

            client = await User.getByDocument(client5LogicalDelete.document.prefix, client5LogicalDelete.document.content);
            removalResult = await admin.removeClient(client.id);
            expect(removalResult.removed).to.be.eq(true);
            expect(removalResult.result).to.be.eq(ClientRemoveResult.SUCCESS_LOGICAL);
            */
        });

        it('Should test the Client - Restore (logical)', async function () {
            this.timeout(8000);

            //let socketClient = socket_client(socketServerAddress).connect();
            let loginResponse;
            let requestPayloadA:IRequests.Client.Restore;
            let client:User;
            let restoreResponse:IRequests.Client.RestoreResponse;

            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin1Data.username,
                            password: <string>admin1Data.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            client = await User.getByDocument(client1Data.document.prefix, client1Data.document.content);
            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:client.id
                }
            };

            restoreResponse = await new Promise<IRequests.Client.RestoreResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_RESTORE, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_RESTORE, function(payload:IRequests.Client.RestoreResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof restoreResponse.payload).to.not.be.eq("string")
            expect((<IClientRestoreResult>restoreResponse.payload).restored).to.be.eq(true);

            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    id:Math.floor(Math.random()*new Date().getTime())
                }
            };

            restoreResponse = await new Promise<IRequests.Client.RestoreResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_RESTORE, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_RESTORE, function(payload:IRequests.Client.RestoreResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });            
            expect((<IClientRestoreResult>restoreResponse.payload).restored).to.be.eq(false);
        });
    });

    //Done
    describe("Test Search", function () {
        let socketClient:SocketIOClient.Socket;
        let socketServerAddress:string = `http://0.0.0.0:${CONNECTION_PARAMETERS.PORT}`;

        beforeEach(()=>{
            socketClient = socket_client(socketServerAddress).connect();
        });

        it('Should test client search', async function () {
            this.timeout(6000);
            
            let loginResponse;
            let searchPayloadA:IRequests.UserSearch;
            let client:User;
            let searchResponse:IRequests.UserSearchResponse;

            let testCase1: IUserSearchOptions = {
                where: {
                    user: {
                        meta: {
                            createdAt: {
                                greater: moment().set('year', 2017).set('month', 1).toDate(),
                                lesser: moment().set('year', 2020).set('month', 1).toDate()
                            },
                            updatedAt: {
                                greater: moment().set('year', 2017).set('month', 1).toDate(),
                                lesser: moment().set('year', 2020).set('month', 1).toDate()
                            },
                            id: {
                                equal: 32
                            }
                        },
                        content: {
                            name: {
                                like: "%adm%"
                            }
                        }
                    },
                    document: {
                        content: {
                            prefix: {
                                equal: DOCUMENT_PREFIXES.CI
                            },
                            content: {
                                like: '%25251%'
                            }
                        }
                    },
                    membership: {
                        meta: {
                            createdAt: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            },
                            updatedAt: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            },
                            id: {
                                equal: 1
                            }
                        },
                        content: {
                            cut_date: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            },
                            inscription_date: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            }
                        }
                    },
                    role: {
                        meta: {
                            createdAt: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            },
                            updatedAt: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            },
                            id: {
                                equal: 1
                            }
                        },
                        content: {
                            canLogin: {
                                equal: true
                            },
                            canChangePassword: {
                                equal: true
                            },
                            canAddAdmin: {
                                equal: true
                            },
                            canUpdateAdmin: {
                                equal: true
                            },
                            canRemoveAdmin: {
                                equal: true
                            },
                            canSearchAdmin: {
                                equal: true
                            },
                            canExportData: {
                                equal: true
                            },
                            canImportData: {
                                equal: true
                            },
                            canIncorporateClient: {
                                equal: true
                            },
                            canUpdateClient: {
                                equal: true
                            },
                            canDesincorporateClient: {
                                equal: true
                            },
                            canSearchClient: {
                                equal: true
                            },
                            canAddPayment: {
                                equal: true
                            },
                            canUpdatePayment: {
                                equal: true
                            },
                            canRemovePayment: {
                                equal: true
                            },
                            canSearchPayment: {
                                equal: true
                            },
                            canUpdateUserRoles: {
                                equal: true
                            }
                        }
                    },
                    jwt: {
                        meta: {
                            createdAt: {
                                greater: moment().set('year', 2017).set('month', 1).toDate(),
                                lesser: moment().set('year', 2020).set('month', 1).toDate()
                            },
                            updatedAt: {
                                greater: moment().set('year', 2017).set('month', 1).toDate(),
                                lesser: moment().set('year', 2020).set('month', 1).toDate()
                            },
                            id: {
                                equal: 32
                            }
                        },
                        content: {
                            token: {
                                like: "%asdasd%",
                                equal: "%dasdasdasd"
                            }
                        }
                    }

                },
                includedRelations: ['login', 'membership', 'role', 'document', 'jwt'],
                orderBy: {
                    membership: {
                        cutDate: 'DESC'
                    }
                },
                paging: {
                    //offset: 2,
                    limit: 4
                }
            }

            testCase1 = {
                where: {
                    membership: {
                        content: {
                            cut_date: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            },
                            inscription_date: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            }
                        }
                    }

                },
                includedRelations: [],
                orderBy: {
                    membership: {
                        cutDate: 'DESC'
                    }
                },
                paging: {
                    //offset: 2,
                    limit: 4
                }
            }

            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin1Data.username,
                            password: <string>admin1Data.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");

            searchPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: testCase1
                    ,resultMode: UserSearchResultMode.ENTITIES
                }
            };

            searchResponse = await new Promise<IRequests.UserSearchResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_SEARCH, searchPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_SEARCH, function(payload:IRequests.UserSearchResponse){
                    if(payload._meta._id === searchPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(searchResponse.payload).to.not.be.eq(undefined);

            let testCase2: IUserSearchOptions = {
                where: {
                    user: {
                        content: {
                            name: {
                                like: `%${client1Data.firstName}%`
                            }
                        }
                    }
                }
                ,includedRelations: ['membership']
                ,orderBy: {
                    membership: {
                        cut_date: 'DESC'
                    }
                }
                ,paging: {
                    //offset: 2,
                    limit: 4
                }
            };
            searchPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: testCase2
                    ,resultMode: UserSearchResultMode.ENTITIES
                }
            };

            searchResponse = await new Promise<IRequests.UserSearchResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_SEARCH, searchPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_SEARCH, function(payload:IRequests.UserSearchResponse){
                    if(payload._meta._id === searchPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(searchResponse.payload).to.not.be.eq(undefined);
            expect((<IRequests.UserSearchSuccessfullResponse>searchResponse.payload).content).to.not.be.eq(undefined);
            expect((<IRequests.UserSearchSuccessfullResponse>searchResponse.payload).content.length).to.be.greaterThan(0);
            
            /*
            let testCase2: IUserSearchOptions = {
                where: {
                    user: {
                        content: {
                            name: {
                                like: `%${admin4LogicalRestore.firstName}%`
                            }
                        }
                    }
                },
                includedRelations: ['membership']
                    //
                    //,
                    //orderBy: {
                    //    membership: {
                    //        cut_date: 'DESC'
                    //    }
                    //}
                    //
                ,
                paging: {
                    //offset: 2,
                    limit: 4
                }
            };

            try {
                let resultB: User[] = await User.searchUser(testCase2, UserSearchResultMode.ENTITIES);
                expect(resultB.length).to.be.greaterThan(0);
            } catch (e) {
                console.log(e);
                expect(e).to.be.equal(null);
            }
        });

        it('Should test admin search', async function () {
            this.timeout(6000);
            
            //let socketClient = socket_client(socketServerAddress).connect();
            let loginResponse;
            let searchPayloadA:IRequests.UserSearch;
            let searchResponse:IRequests.UserSearchResponse;

            let testCase1: IUserSearchOptions = {
                where: {
                    user: {
                        meta: {
                            createdAt: {
                                greater: moment().set('year', 2017).set('month', 1).toDate(),
                                lesser: moment().set('year', 2020).set('month', 1).toDate()
                            },
                            updatedAt: {
                                greater: moment().set('year', 2017).set('month', 1).toDate(),
                                lesser: moment().set('year', 2020).set('month', 1).toDate()
                            },
                            id: {
                                equal: 32
                            }
                        },
                        content: {
                            name: {
                                like: "%adm%"
                            }
                        }
                    },
                    document: {
                        content: {
                            prefix: {
                                equal: DOCUMENT_PREFIXES.CI
                            },
                            content: {
                                like: '%25251%'
                            }
                        }
                    },
                    membership: {
                        meta: {
                            createdAt: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            },
                            updatedAt: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            },
                            id: {
                                equal: 1
                            }
                        },
                        content: {
                            cut_date: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            },
                            inscription_date: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            }
                        }
                    },
                    role: {
                        meta: {
                            createdAt: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            },
                            updatedAt: {
                                greater: moment().set('year', 2018).set('month', 6).toDate(),
                                lesser: moment().set('year', 2019).set('month', 8).toDate()
                            },
                            id: {
                                equal: 1
                            }
                        },
                        content: {
                            canLogin: {
                                equal: true
                            },
                            canChangePassword: {
                                equal: true
                            },
                            canAddAdmin: {
                                equal: true
                            },
                            canUpdateAdmin: {
                                equal: true
                            },
                            canRemoveAdmin: {
                                equal: true
                            },
                            canSearchAdmin: {
                                equal: true
                            },
                            canExportData: {
                                equal: true
                            },
                            canImportData: {
                                equal: true
                            },
                            canIncorporateClient: {
                                equal: true
                            },
                            canUpdateClient: {
                                equal: true
                            },
                            canDesincorporateClient: {
                                equal: true
                            },
                            canSearchClient: {
                                equal: true
                            },
                            canAddPayment: {
                                equal: true
                            },
                            canUpdatePayment: {
                                equal: true
                            },
                            canRemovePayment: {
                                equal: true
                            },
                            canSearchPayment: {
                                equal: true
                            },
                            canUpdateUserRoles: {
                                equal: true
                            }
                        }
                    },
                    jwt: {
                        meta: {
                            createdAt: {
                                greater: moment().set('year', 2017).set('month', 1).toDate(),
                                lesser: moment().set('year', 2020).set('month', 1).toDate()
                            },
                            updatedAt: {
                                greater: moment().set('year', 2017).set('month', 1).toDate(),
                                lesser: moment().set('year', 2020).set('month', 1).toDate()
                            },
                            id: {
                                equal: 32
                            }
                        },
                        content: {
                            token: {
                                like: "%asdasd%",
                                equal: "%dasdasdasd"
                            }
                        }
                    }

                },
                includedRelations: ['login', 'membership', 'role', 'document', 'jwt'],
                orderBy: {
                    membership: {
                        cutDate: 'DESC'
                    }
                },
                paging: {
                    //offset: 2,
                    limit: 4
                }
            }


            testCase1 = {
                where: {
                    user:{
                        meta:{
                            createdAt:{
                                greater: new Date()
                            }
                        }
                    },
                    document: {
                        content: {
                            prefix: {
                                equal: DOCUMENT_PREFIXES.CI
                            },
                            content: {
                                like: '%99999999999999%'
                            }
                        }
                    }
                },
                includedRelations: ['login', 'membership', 'role', 'document', 'jwt'],
                orderBy: {
                    user: {
                        createdAt: 'DESC'
                    }
                },
                paging: {
                    //offset: 2,
                    limit: 4
                }
            }
            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            searchPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*999999)
                },
                payload:{
                    content: testCase1
                    ,resultMode: UserSearchResultMode.ENTITIES
                }
            };

            searchResponse = await new Promise<IRequests.UserSearchResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.ADMIN_SEARCH, searchPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.ADMIN_SEARCH, function(payload:IRequests.UserSearchResponse){
                    if(payload._meta._id === searchPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            console.log(`
            
            searchResponse: ${JSON.stringify(searchResponse)}
            
            `);
            expect(searchResponse.payload).to.not.be.eq(undefined);
            expect((<IRequests.UserSearchSuccessfullResponse>searchResponse.payload).content).to.not.be.eq(undefined);
            expect((<IRequests.UserSearchSuccessfullResponse>searchResponse.payload).content.length).to.be.lessThan(1);
            /*
            let testCase2: IUserSearchOptions = {
                where: {
                    user: {
                        content: {
                            name: {
                                like: `%${admin1Data.firstName}%`
                            }
                        }
                    }
                }
                ,includedRelations: ['membership']
                ,orderBy: {
                    membership: {
                        cut_date: 'DESC'
                    }
                }
                ,paging: {
                    //offset: 2,
                    limit: 4
                }
            };


            searchPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: testCase2
                    ,resultMode: UserSearchResultMode.ENTITIES
                }
            };

            searchResponse = await new Promise<IRequests.UserSearchResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.ADMIN_SEARCH, searchPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.ADMIN_SEARCH, function(payload:IRequests.UserSearchResponse){
                    if(payload._meta._id === searchPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(searchResponse.payload).to.not.be.eq(undefined);
            expect((<IRequests.UserSearchSuccessfullResponse>searchResponse.payload).content).to.not.be.eq(undefined);
            expect((<IRequests.UserSearchSuccessfullResponse>searchResponse.payload).content.length).to.not.be.lessThan(1);
            */
        });

        it('Should test the payment search', async function () {
            this.timeout(6000);
            //let socketClient = socket_client(socketServerAddress).connect();
            let loginResponse;
            let searchPayloadA:IRequests.Payment.Search;
            let searchResponse:IRequests.Payment.SearchResponse;

            let testCase1: IPaymentSearchOption = {
                where: {
                    payment: {
                        meta: {
                            status: {
                                equal: 1
                            }
                        },
                        content: {
                            ammount: {
                                greater: 600000
                            },
                            foreign_key_currency: {
                                equal: "VES"
                            }
                        }
                    }
                },
                includedRelations: ['membership','currency','user']
            }

            let testCase2: IPaymentSearchOption = {
                where: {
                    payment: {
                        meta: {
                            status: {
                                equal: 1
                            }
                        },
                        content: {
                            ammount: {
                                greater: 6000
                            },
                            foreign_key_currency: {
                                equal: "VES"
                            },
                            foreign_key_membership: {
                                equal: 9999999
                            }
                        }
                    }
                },
                includedRelations: ['membership']
            }

            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>admin1Data.username,
                            password: <string>admin1Data.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            searchPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: testCase1
                    ,resultMode: PaymentResultMode.ENTITIES
                }
            };

            searchResponse = await new Promise<IRequests.Payment.SearchResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_SEARCH, searchPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_SEARCH, function(payload:IRequests.Payment.SearchResponse){
                    if(payload._meta._id === searchPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            //console.log(`searchResponse: `,JSON.stringify(searchResponse));
            expect(searchResponse.payload).to.not.be.eq(undefined);
            expect((<IRequests.Payment.SearchSuccessfullResponse>searchResponse.payload).content).to.not.be.eq(undefined);
            expect((<IRequests.Payment.SearchSuccessfullResponse>searchResponse.payload).content.length).to.be.greaterThan(0);

            ///*

            searchPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content: testCase2
                    ,resultMode: PaymentResultMode.ENTITIES
                }
            };

            searchResponse = await new Promise<IRequests.Payment.SearchResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_SEARCH, searchPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.CLIENT_PAYMENT_SEARCH, function(payload:IRequests.Payment.SearchResponse){
                    if(payload._meta._id === searchPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(searchResponse.payload).to.not.be.eq(undefined);
            expect((<IRequests.Payment.SearchSuccessfullResponse>searchResponse.payload).content).to.not.be.eq(undefined);
            expect((<IRequests.Payment.SearchSuccessfullResponse>searchResponse.payload).content.length).to.be.eq(0);

            let searchResult = await SearchProvider.Instance.searchPayment({
                where: {
                    payment: {
                        meta: {
                            status: {
                                equal: 1
                            }
                        },
                        content: {
                            ammount: {
                                greater: 6000
                            },
                            foreign_key_currency: {
                                equal: "VES"
                            },
                            foreign_key_membership: {
                                equal: 5
                            }
                        }
                    }
                },
                includedRelations: ['membership']
            }, PaymentResultMode.ENTITIES);
            //expect(searchResult.length).to.be.greaterThan(0);
            //expect(searchResult[0]).to.be.instanceOf(Payment);
            //*/
        });
    });

    //Done
    describe("Should test Database Backup / restore", function () {
        let socketClient:SocketIOClient.Socket;
        let socketServerAddress:string = `http://0.0.0.0:${CONNECTION_PARAMETERS.PORT}`;
        superAdminData.username = "admin4";
        superAdminData.password = "admin4";

        beforeEach(()=>{
            socketClient = socket_client(socketServerAddress).connect();
        });

        //Locación del archivo generado por el dump.
        let outputFileLocation:string;

        it('Should back-up the database', async function(){
            let exportDataRequest:IRequests.Data.Export;
            let exportdataResponse:IRequests.Data.ExportResponse;

            //Export with SuperAdmin Account
            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            let loginResponse:IRequests.Auth.LogInResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            //Data Export Payload
            exportDataRequest = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                }
            };
            exportdataResponse = await new Promise<IRequests.Data.ExportResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.DATA_EXPORT, exportDataRequest);
                socketClient.on(SOCKET_CALL_ROUTES.DATA_EXPORT, function(payload:IRequests.Data.ExportResponse){
                    if(payload._meta._id === exportDataRequest._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof exportdataResponse.payload).to.not.be.eq("string")
            expect(typeof (<IExportResult>exportdataResponse.payload).outputFileLocation).to.be.eq("string");
            outputFileLocation = (<IExportResult>exportdataResponse.payload).outputFileLocation;
        });

        it('Should restore the database', async function(){
            this.timeout(6000);
            let importRequestPayload:IRequests.Data.Import;
            let importResponse:IRequests.Data.ImportResponse;

            //Import with SuperAdmin Account
            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            let loginResponse:IRequests.Auth.LogInResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            //Data Import Payload
            importRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                }
                ,payload:{
                    file:outputFileLocation
                }
            };
            importResponse = await new Promise<IRequests.Data.ImportResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.DATA_IMPORT, importRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.DATA_IMPORT, function(payload:IRequests.Data.ImportResponse){
                    if(payload._meta._id === importRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof importResponse.payload).to.be.eq("object")
            expect((<IImportResult>importResponse.payload).result).to.be.eq(ImportResultCode.SUCCESS);
        });

        it('Should upload a dump via file upload and restore the database', async function(){
            let importRequestPayload:IRequests.Data.ImportFileUpload;
            let importResponse:IRequests.Data.ImportFileUploadResponse;
            let fileLocation = "./dumps/2019_5_14_10_59_36_dump.zip";
            let fileName = "2019_5_14_10_59_36_dump.zip";

            let fileBuffer = fs.readFileSync(fileLocation);

            //Import with SuperAdmin Account
            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            let loginResponse:IRequests.Auth.LogInResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            //Data Import Payload
            importRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                }
                ,payload:{
                    files:[fileBuffer],
                    fileNames:[fileName]
                }
            };
            importResponse = await new Promise<IRequests.Data.ImportFileUploadResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.DATA_IMPORT_FILE_UPLOAD, importRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.DATA_IMPORT_FILE_UPLOAD, function(payload:IRequests.Data.ImportFileUploadResponse){
                    if(payload._meta._id === importRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof importResponse.payload).to.be.eq("object")
            expect((<IFileUploadResult>importResponse.payload).filePaths.length).to.be.greaterThan(0);
        });
    });

    describe("Should test basic system routes", function(){
        let socketClient:SocketIOClient.Socket;
        let socketServerAddress:string = `http://0.0.0.0:${CONNECTION_PARAMETERS.PORT}`;

        beforeEach(()=>{
            socketClient = socket_client(socketServerAddress).connect();
        });

        it("Should update the company", async function(){
            let loginResponse;
            let requestPayloadA:IRequests.Company.Update;
            let updateResponse:IRequests.Company.UpdateResponse;

            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);

            loginResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");

            requestPayloadA = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    name:"Gym - "+(new Date().getTime())
                }
            };

            updateResponse = await new Promise<IRequests.Company.UpdateResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.COMPANY_UPDATE, requestPayloadA);
                socketClient.on(SOCKET_CALL_ROUTES.COMPANY_UPDATE, function(payload:IRequests.Company.UpdateResponse){
                    if(payload._meta._id === requestPayloadA._meta._id){
                        accept(payload);
                    }
                });
            });

            expect(typeof updateResponse.payload).to.not.be.eq("string")
            expect((<ICompanyUpdateResult>updateResponse.payload).updated).to.be.eq(true);
            socketClient.disconnect();
        });

        it("Should get the company", async function(){
            //let socketClient = socket_client(socketServerAddress).connect();
            let getRequestPayload:IRequests.Company.Get;
            let getResponse:IRequests.Company.GetResponse;

            getRequestPayload = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime())
                }
            };

            getResponse = await new Promise<IRequests.Company.GetResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.COMPANY_GET, getRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.COMPANY_GET, function(payload:IRequests.Company.GetResponse){
                    if(payload._meta._id === getRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });

            expect(typeof getResponse.payload).to.not.be.eq("string")
            socketClient.disconnect();
        });

        it("Should get the currencies", async function(){
            //let socketClient = socket_client(socketServerAddress).connect();
            let getRequestPayload:IRequests.Currency.Get;
            let getResponse:IRequests.Currency.GetResponse;

            getRequestPayload = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime())
                }
            };

            getResponse = await new Promise<IRequests.Currency.GetResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.CURRENCY_GET, getRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.CURRENCY_GET, function(payload:IRequests.Currency.GetResponse){
                    if(payload._meta._id === getRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });            

            expect(typeof getResponse.payload).to.not.be.eq("string");
            expect(getResponse.payload.length).to.be.greaterThan(0);
            socketClient.disconnect();
        });

        it('Should get the payment methods', async function(){
            //let socketClient = socket_client(socketServerAddress).connect();

            //Export with SuperAdmin Account
            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            let loginResponse:IRequests.Auth.LogInResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            let getRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                }
            };

            let getResponse = await new Promise<IRequests.PaymentMethods.GetResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.PAYMENT_METHOD_GET, getRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.PAYMENT_METHOD_GET, function(payload:IRequests.PaymentMethods.GetResponse){
                    if(payload._meta._id === getRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof getResponse.payload).to.not.be.eq("string")
            expect(Object.keys(getResponse.payload).length).to.be.greaterThan(0)
            socketClient.disconnect();
        });

        it('Should get the document types', async function(){
            //let socketClient = socket_client(socketServerAddress).connect();

            //Export with SuperAdmin Account
            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            let loginResponse:IRequests.Auth.LogInResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            let getRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                }
            };

            let getResponse = await new Promise<IRequests.PaymentMethods.GetResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.DOCUMENT_TYPE_GET, getRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.DOCUMENT_TYPE_GET, function(payload:IRequests.PaymentMethods.GetResponse){
                    if(payload._meta._id === getRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(typeof getResponse.payload).to.not.be.eq("string")
            expect(Object.keys(getResponse.payload).length).to.be.greaterThan(0)
            socketClient.disconnect();
        });

        it('Should get the base roles', async function(){
            //let socketClient = socket_client(socketServerAddress).connect();

            //Export with SuperAdmin Account
            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            let loginResponse:IRequests.Auth.LogInResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            let getRequestPayload = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                }
            };

            let getResponse = await new Promise<IRequests.BaseRoles.GetResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.BASE_ROLE_GET, getRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.BASE_ROLE_GET, function(payload:IRequests.BaseRoles.GetResponse){
                    if(payload._meta._id === getRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });

            expect(typeof getResponse.payload).to.not.be.eq("string")
            expect(Object.keys(getResponse.payload).length).to.be.greaterThan(0)
            socketClient.disconnect();
        });

        it("Should get the personal profile (+ tables)", async function(){
            //let socketClient = socket_client(socketServerAddress).connect();

            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            let loginResponse:IRequests.Auth.LogInResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            let getRequestPayload:IRequests.UserSearch = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    content:{
                        where:{},
                        includedRelations:['role','membership','jwt','document']
                    },
                    resultMode:UserSearchResultMode.ENTITIES
                }
            };

            let getResponse = await new Promise<IRequests.UserSearchResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.PERSONAL_PROFILE_GET, getRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.PERSONAL_PROFILE_GET, function(payload:IRequests.UserSearchResponse){
                    if(payload._meta._id === getRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });

            expect(typeof getResponse.payload).to.not.be.eq("string")
            expect((<IRequests.UserSearchSuccessfullResponse>getResponse.payload).content.length).to.be.greaterThan(0);
            expect((<toJson.IUser>(<IRequests.UserSearchSuccessfullResponse>getResponse.payload).content[0]).role).to.not.be.eq(undefined);
            socketClient.disconnect();
        });

        it('Should test the log search', async function(){
            //let socketClient = socket_client(socketServerAddress).connect();

            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,
                        }
                    }
                }
            };
            
            let loginResponse:IRequests.Auth.LogInResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            let getRequestPayload:IRequests.Logs.Get = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                },
                payload:{
                    searchOptions:{
                        where:{},
                        includedRelations:['log_content']
                        ,orderBy:{
                            log:{
                                createdAt:'DESC'
                            }
                        }
                        ,paging:{
                            limit: 3
                            ,offset: 0
                        }
                    },
                    resultMode:LogResultMode.ENTITIES
                }
            };

            let getResponse = await new Promise<IRequests.Logs.GetResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.LOG_SEARCH, getRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.LOG_SEARCH, function(payload:IRequests.Logs.GetResponse){
                    if(payload._meta._id === getRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });

            expect((<any[]>getResponse.payload).length).to.be.eq(3);
            getRequestPayload.payload.resultMode = LogResultMode.RAW_AND_ENTITIES;
            getResponse = await new Promise<IRequests.Logs.GetResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.LOG_SEARCH, getRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.LOG_SEARCH, function(payload:IRequests.Logs.GetResponse){
                    if(payload._meta._id === getRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect((<any>getResponse.payload).entities.length).to.be.eq(3);
            socketClient.disconnect();
        });

        it('Should get the list of backups', async function(){
            let exportDataRequest:IRequests.Data.Export;
            let exportdataResponse:IRequests.Data.ExportListResponse;

            //Export with SuperAdmin Account
            let loginRequestPayload:IRequests.Auth.LogIn = {
                _meta:{
                    _id: Math.floor(Math.random()*new Date().getTime()),
                    _auth:{
                        jwt:null,
                        login:{
                            username: <string>superAdminData.username,
                            password: <string>superAdminData.password,//superAdminData.password
                        }
                    }
                }
            };
            
            let loginResponse:IRequests.Auth.LogInResponse = await new Promise<IRequests.Auth.LogInResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.AUTH_LOGIN, loginRequestPayload);
                socketClient.on(SOCKET_CALL_ROUTES.AUTH_LOGIN, function(payload:IRequests.Auth.LogInResponse){
                    if(payload._meta._id === loginRequestPayload._meta._id){
                        accept(payload);
                    }
                });
            });
            expect(loginResponse.payload.logIn).to.be.eq(true);
            expect(typeof loginResponse.payload.data.jwt).to.be.eq("object");
            expect(typeof loginResponse.payload.data.token).to.be.eq("string");


            //Data Export Payload
            exportDataRequest = {
                _meta:{
                    _auth:{
                        jwt: loginResponse.payload.data.token
                    },
                    _id: Math.floor(Math.random()*new Date().getTime())
                }
            };
            exportdataResponse = await new Promise<IRequests.Data.ExportListResponse>((accept)=>{
                socketClient.emit(SOCKET_CALL_ROUTES.DATA_EXPORT_LIST_REQUEST, exportDataRequest);
                socketClient.on(SOCKET_CALL_ROUTES.DATA_EXPORT_LIST_REQUEST, function(payload:IRequests.Data.ExportListResponse){
                    if(payload._meta._id === exportDataRequest._meta._id){
                        accept(payload);
                    }
                });
            });
            console.log(`exportdataResponse: `,exportdataResponse);
            expect(typeof exportdataResponse.payload).to.not.be.eq("string");
        });

        it('Should test the backup download', async function(){
            this.timeout(8000);
            await new Promise((accept)=>{
                let fileName = "2018_12_27_15_35_59_dump.zip";
                http.get(`http://localhost:8036/downloadBackup/${fileName}`, function(response){
                    //console.log(`response.statusCode: ${response.statusCode}`)
                    var file = fs.createWriteStream(`./${fileName}`);
                    response.pipe(file);
                    file.on('finish', ()=>{
                        file.close();
                        accept();
                    });
                    file.on('error', function(error){
                        file.close();
                        console.log(`An error has ocurred: `,error);
                        accept();
                    })
                })
            });
        });
    });
});