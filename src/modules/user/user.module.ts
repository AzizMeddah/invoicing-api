import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserRepositoryModule } from './repositories/user.repository.module';
import { PermissionModule } from '../permission/permission.module';
import { RoleModule } from '../role/role.module';

@Module({
  controllers: [],
  providers: [UserService],
  exports: [UserService, UserRepositoryModule],
  imports: [
    UserRepositoryModule,
    forwardRef(()=>PermissionModule),
    forwardRef(()=>RoleModule),
  ],
})
export class UsersModule {}
