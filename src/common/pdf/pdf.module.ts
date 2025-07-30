import { Module } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  exports: [PdfService],
  providers: [PdfService],
  controllers: [],
  imports:[ConfigModule]
})
export class PdfModule {}
