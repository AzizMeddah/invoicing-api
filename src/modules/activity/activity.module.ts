import { Module } from '@nestjs/common';
import { ActivityRepositoryModule } from './repositories/activity.repository.module';
import { ActivityService } from './services/activity.service';
import { PermissionModule } from '../permission/permission.module';
import { UsersModule } from '../user/user.module';

@Module({
  controllers: [],
  providers: [ActivityService],
  exports: [ActivityService],
  imports: [
    ActivityRepositoryModule,
    PermissionModule,
    UsersModule
  ],
})
export class ActivityModule {}
