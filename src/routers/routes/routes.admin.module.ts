import { Module } from '@nestjs/common';
import { LoggerController } from 'src/common/logger/controllers/logger.controller';
import { LoggerModule } from 'src/common/logger/logger.module';
import { PermissionController } from 'src/modules/permission/controllers/permission.controller';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { UsersModule } from 'src/modules/user/user.module';

@Module({
  controllers: [
    LoggerController,
    PermissionController
  ],
  providers: [],
  exports: [],
  imports: [
    LoggerModule,
    PermissionModule,
    UsersModule
  ],
})
export class RoutesAdminModule {}
