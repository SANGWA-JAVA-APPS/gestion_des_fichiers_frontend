export const PERMISSIONS = {
  ACCOUNT: {
    READ: 'account:read',
    CREATE: 'account:create',
    UPDATE: 'account:update',
    DELETE: 'account:delete'
  },

  LOCATION: {
    READ: 'location:read',
    MANAGE: 'location:manage'
  },

  DOCUMENT: {
    READ: 'document:read',
    DOCSTATUS_READ: 'document:docstatus:read',
    ESTATE_READ: 'document:estate:read',
    CERT_LICENSE_READ: 'document:cert-license:read'
  }
}

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  AGENT: 'AGENT',
  VIEWER: 'VIEWER',
  USER: 'USER'
}
