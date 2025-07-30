// permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionMetadata, PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { UserService } from 'src/modules/user/services/user.service';
import { PermissionService } from '../services/permission.service';


@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly permissionService: PermissionService,


) {}

 // permissions.guard.ts
async canActivate(context: ExecutionContext): Promise<boolean> {
  const metadata = this.reflector.getAllAndOverride<PermissionMetadata>(PERMISSIONS_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (!metadata) {
    return true; // No permissions required
  }

  const request = context.switchToHttp().getRequest();
  const user = request.user;

  const userPermissions = await this.permissionService.getUserPermissions(user.sub) || [];

  const hasAll = metadata.all?.every(p => userPermissions.includes(p)) ?? true;
  const hasAny = metadata.any?.some(p => userPermissions.includes(p)) ?? true;

  if (!(hasAll && hasAny)) {
    throw new ForbiddenException('Access denied: insufficient permissions');
  }

  return true;
}
}
