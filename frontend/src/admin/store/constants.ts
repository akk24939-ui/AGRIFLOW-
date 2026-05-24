// Runtime constants — safe to import as values in JS/TSX components
export const ROLES = ['ADMIN', 'OWNER', 'CUSTOMER', 'WORKER'] as const;
export type Role = typeof ROLES[number];

export const USER_STATUSES = ['ACTIVE', 'DISABLED', 'DELETED'] as const;
export type UserStatus = typeof USER_STATUSES[number];

export const LAND_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type LandStatus = typeof LAND_STATUSES[number];

export const LOGIN_STATUSES = ['SUCCESS', 'FAILED'] as const;
export type LoginStatus = typeof LOGIN_STATUSES[number];
