import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { ConfigModule } from '@nestjs/config';
import { CabinetModule } from 'src/modules/cabinet/cabinet.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  exports: [MailService],
  providers: [MailService],
  controllers: [],
  imports: [
    ConfigModule,
    CabinetModule,
    PdfModule
  ]
})
export class MailModule { }
