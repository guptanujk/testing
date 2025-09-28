const defaultRoles = [
  {
    id: 1,
    name: "Owner"
  },
  {
    id: 2,
    name: "User"
  }
]

const permissions = {
  permissions: {
    // people: ["view", "create","update"], //This is people list in Projects navProjects page
  },
  grants: {
  
  }
}

export default {
  defaultRoles, permissions
}