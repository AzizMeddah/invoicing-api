import { forwardRef, Module } from '@nestjs/common';
import { PermissionService } from './services/permission.service';
import { PermissionRepositoryModule } from './repositories/permission.repository.module';
import { UsersModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';

@Module({
  controllers: [],
  providers: [PermissionService],
  exports: [PermissionService],
  imports: [
    PermissionRepositoryModule,
    forwardRef(() => UsersModule),
  ],
})
export class PermissionModule {}
