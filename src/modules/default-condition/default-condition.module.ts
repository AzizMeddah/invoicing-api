import { Module } from '@nestjs/common';
import { DefaultConditionService } from './services/default-condition.service';
import { DefaultConditionRepositoryModule } from './repositories/default-condition.repository.module';
import { PermissionModule } from '../permission/permission.module';
import { UsersModule } from '../user/user.module';

@Module({
  controllers: [],
  providers: [DefaultConditionService],
  exports: [DefaultConditionService],
  imports: [
    DefaultConditionRepositoryModule,
    PermissionModule,
    UsersModule
  ],
})
export class DefaultConditionModule {}
