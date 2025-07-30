import { ApiProperty } from "@nestjs/swagger";
import { MonthlyFluxDto } from "./monthly-flux.dto";
import { TopFirmDto } from "src/modules/firm/dtos/top-firm.dto";



export class ResponseUserStatsDto {
  relatedQuotation?:number;
  relatedInvoices?:number;
  relatedPayments?:number;

  totalActions?:number;
  monthlyActions?:number;
  weeklyActions?:number;
  peakHours?:number;

  totalSystemActions?:number;

  firmActions?:number;
  interlocutorActions?:number;
  sellingActions?:number;
  buyingActions?:number;
  systemActions?:number;
  adminstrativeActions?:number;

}