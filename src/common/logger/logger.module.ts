import { Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { LoggerRepositoryModule } from './repositories/logger.repository.module';
import { PermissionModule } from 'src/modules/permission/permission.module';

@Module({
  controllers: [],
  providers: [LoggerService],
  exports: [LoggerService],
  imports: [
    LoggerRepositoryModule,
    PermissionModule
  ],
})
export class LoggerModule {}
