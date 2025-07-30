import { Module } from '@nestjs/common';
import { TaxWithholdingService } from './services/tax-withholding.service';
import { TaxWithholdingRepositoryModule } from './repositories/tax-withholding.repository.module';
import { PermissionModule } from '../permission/permission.module';
import { UsersModule } from '../user/user.module';

@Module({
  controllers: [],
  providers: [TaxWithholdingService],
  exports: [TaxWithholdingService],
  imports: [
    TaxWithholdingRepositoryModule,
    PermissionModule,
    UsersModule
  ],
})
export class TaxWithholdingModule {}
