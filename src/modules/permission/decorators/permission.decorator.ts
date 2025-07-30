// permission.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export type PermissionMetadata = {
  all?: string[];
  any?: string[];
};

export const Permissions = (permissions: PermissionMetadata) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
