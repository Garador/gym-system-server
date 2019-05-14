import {BaseRoles} from '../base/RoleBase';
import {TableNames} from './Database';

//Los IDs de los roles,tal como están definidos en los archivos /base/RoleBase
export const BASE_ROLE_IDS = {
    SUPER_ADMIN :   BaseRoles[0][TableNames.Role_base.id],
    ADMIN :         BaseRoles[1][TableNames.Role_base.id],
    CLIENT :        BaseRoles[2][TableNames.Role_base.id],
}