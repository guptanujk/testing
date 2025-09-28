// var { RBAC } = require('rbac');
import RBAC from './rbac'
import data from '../../constants/roles';
export const rbac = new RBAC(data.permissions);