export interface IUserList {
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  roleId: number,
  roleName?: string,
  departmentId: number,
  departmentName?: string,
}

export interface IUserBasicDetails {
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  roleId?: number,
  roleName?: string,
}
export interface IUserDetails {
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  password?: string,
  type?: string,
  isActive?: boolean,
}


export interface IUsersCount {
  count: number,
}
