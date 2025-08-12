import { forwardRef, Module } from '@nestjs/common';
import { FirmInterlocutorEntryService } from './services/firm-interlocutor-entry.service';
import { FirmInterlocutorEntryRepositoryModule } from './repositories/firm-interlocutor-entry.repository.module';
import { InterlocutorModule } from '../interlocutor/Interlocutor.module';
import { PermissionModule } from '../permission/permission.module';
import { UsersModule } from '../user/user.module';

@Module({
  controllers: [],
  providers: [FirmInterlocutorEntryService],
  exports: [FirmInterlocutorEntryService, FirmInterlocutorEntryRepositoryModule],
  imports: [
    FirmInterlocutorEntryRepositoryModule,
    forwardRef(()=>InterlocutorModule),
    PermissionModule,
    UsersModule
  ],
})
export class FirmInterlocutorEntryModule {}
