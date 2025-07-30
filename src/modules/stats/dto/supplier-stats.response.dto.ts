import { ApiProperty } from "@nestjs/swagger";
import { ResponseSellingInvoiceDto } from "src/modules/invoice/selling-invoice/dtos/selling-invoice.response.dto";
import { ResponseSellingPaymentDto } from "src/modules/payment/selling-payment/dtos/selling-payment.response.dto";
import { ResponseSellingQuotationDto } from "src/modules/quotation/selling-quotation/dtos/selling-quotation.response.dto";
import { StatusStatsDto } from "./status-stats.dto";
import { SellingPaymentEntity } from "src/modules/payment/selling-payment/repositories/entities/selling-payment.entity";
import { SellingInvoiceEntity } from "src/modules/invoice/selling-invoice/repositories/entities/selling-invoice.entity";
import { SellingQuotationEntity } from "src/modules/quotation/selling-quotation/repositories/entities/selling-quotation.entity";
import { BuyingQuotationEntity } from "src/modules/quotation/buying-quotation/repositories/entities/buying-quotation.entity";
import { BuyingInvoiceEntity } from "src/modules/invoice/buying-invoice/repositories/entities/buying-invoice.entity";
import { BuyingPaymentEntity } from "src/modules/payment/buying-payment/repositories/entities/buying-payment.entity";
import { MonthlyFluxDto } from "./monthly-flux.dto";

export class ResponseSupplierStatsDto {
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

    @ApiProperty({
      type: [MonthlyFluxDto],
      description: 'Flux mensuels des ventes'
    })
    salesMonthlyFlux?: MonthlyFluxDto[];
  
    @ApiProperty({
      type: [MonthlyFluxDto],
      description: 'Flux mensuels des achats'
    })
    purchasesMonthlyFlux?: MonthlyFluxDto[];

}