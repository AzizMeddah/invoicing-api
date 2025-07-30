import { ApiProperty } from "@nestjs/swagger";
import { MonthlyFluxDto } from "./monthly-flux.dto";
import { TopFirmDto } from "src/modules/firm/dtos/top-firm.dto";



export class ResponseGlobalStatsDto {
  @ApiProperty({
    type: Number,
    example: 85000.75,
    description: 'Somme totale des dépenses (buying_payment.amount)'
  })
  totalExpenses?: number;

  @ApiProperty({
    type: Number,
    example: 120000.50,
    description: 'Somme totale des revenus (selling_payment.amount)'
  })
  totalIncome?: number;

  @ApiProperty({
    type: Number,
    example: 35000.25,
    description: 'Trésorerie nette (totalIncome - totalExpenses)'
  })
  netProfit?: number;

  @ApiProperty({
    type: Number,
    example: 35000.25,
    description: 'Trésorerie nette (totalIncome - totalExpenses)'
  })
  netMargin?: number;

  @ApiProperty({
    type: [TopFirmDto],
    description: 'Top 3 clients par montant dépensé'
  })
  topClients?: TopFirmDto[];

  @ApiProperty({
    type: [TopFirmDto],
    description: 'Top 3 fournisseurs par montant payé'
  })
  topSuppliers?: TopFirmDto[];

  @ApiProperty({
    type: Number,
    example: 25.5,
    description: 'Return on Investment en pourcentage'
  })
  roi?: number;

  @ApiProperty({
    type: Number,
    example: 3,
    description: 'Nombre total de paiements en retard'
  })
  overduePayments?: number;

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

  @ApiProperty({
    type: Number,
    example: 25.5,
  })
  payableAmount?: number;

  @ApiProperty({
    type: Number,
    example: 25.5,
  })
  receivableAmount?: number;

  @ApiProperty({
    type: Number,
    example: 25.5,
  })
  dpo?: number;

  @ApiProperty({
    type: Number,
    example: 25.5,
  })
  dso?: number;


}