import { Module } from '@nestjs/common';
import { TaxService } from './services/tax.service';
import { TaxRepositoryModule } from './repositories/tax.repository.module';
import { PermissionModule } from '../permission/permission.module';
import { UsersModule } from '../user/user.module';

@Module({
  controllers: [],
  providers: [TaxService],
  exports: [TaxService],
  imports: [
    TaxRepositoryModule,
    PermissionModule,
    UsersModule
  ],
})
export class TaxModule {}
