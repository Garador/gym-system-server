import { User } from "../models/User";
import { Login } from "../models/Login";

let user = new User();
user.status = 1;
user.firstName = "SuperAdmin";
user.surName = "";

user.login = <any>new Login();