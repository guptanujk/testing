// @flow
import Permission from './permission';
import Role from './role';
import Base from './base';
import type RBAC from './rbac';

export default class Storage {
  rbac:RBAC={} as RBAC;

  useRBAC(rbac: RBAC): void {
    if (this.rbac && Object.keys(this.rbac).length>0) {
      throw new Error('Storage is already in use with another instance of RBAC');
    }

    this.rbac = rbac;
  }

  /**
   * Get instances of Roles and Permissions assigned to role
   * @method Storage#getGrants
   * @param  {String} role Name of role
   * @return {Base[]}
   */
  async getGrants(role: string) {
    throw new Error('Storage method getGrants is not implemented');
  }
}
