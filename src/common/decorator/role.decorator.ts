import { SetMetadata } from '@nestjs/common';

// User Entity에 사용될 Enum을 사용하면 됨
export enum Role {
  Admin = 'ADMIN',
  User = 'USER',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
