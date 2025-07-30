import { ApiProperty } from "@nestjs/swagger";

import { StatusStatsDto } from "./status-stats.dto";
import { ResponseBuyingQuotationDto } from "src/modules/quotation/buying-quotation/dtos/buying-quotation.response.dto";
import { ResponseBuyingPaymentDto } from "src/modules/payment/buying-payment/dtos/buying-payment.response.dto";
import { ResponseBuyingInvoiceDto } from "src/modules/invoice/buying-invoice/dtos/buying-invoice.response.dto";
import { SellingInvoiceEntity } from "src/modules/invoice/selling-invoice/repositories/entities/selling-invoice.entity";
import { SellingPaymentEntity } from "src/modules/payment/selling-payment/repositories/entities/selling-payment.entity";
import { SellingQuotationEntity } from "src/modules/quotation/selling-quotation/repositories/entities/selling-quotation.entity";
import { BuyingInvoiceEntity } from "src/modules/invoice/buying-invoice/repositories/entities/buying-invoice.entity";
import { BuyingPaymentEntity } from "src/modules/payment/buying-payment/repositories/entities/buying-payment.entity";
import { BuyingQuotationEntity } from "src/modules/quotation/buying-quotation/repositories/entities/buying-quotation.entity";

export class ResponseBuyingStatsDto {
  @ApiProperty({
    type: Object,
    description: 'Financial indicators for purchases'
  })
  financialMetrics: {
    totalExpenses: number;
    totalDiscount: number;
    totalTax: number;
    totalWithholding: number;
    averageOrderValue: number;
    overduePayments: number;
    payableAmount?: number;
  };

  @ApiProperty({
    type: Object,
    description: 'Purchase process metrics'
  })
  processMetrics: {
    quotationToInvoice:number;
    quotationToInvoiceTime: number;
    invoiceToPaymentTime: number; 

  };

  @ApiProperty({
    type: Object,
    description: 'Status statistics for purchasing'
  })
  statusStatistics: {
    quotations: StatusStatsDto[];
    invoices: StatusStatsDto[];
  };

  @ApiProperty({
    type: Object,
    description: 'Recent activities'
  })
  recentActivities: {
    quotations:SellingQuotationEntity[] | BuyingQuotationEntity [];
    invoices: SellingInvoiceEntity[] | BuyingInvoiceEntity [];
    payments: SellingPaymentEntity[] | BuyingPaymentEntity [];
  };


  @ApiProperty({
    type: Object,
    description: 'Purchase count trends by period'
  })
  countTrends: {
    quotations:{date:string;count:number;}[];
    invoices: {date:string;count:number;}[];
    payments: {date:string;count:number;}[];
  };
}