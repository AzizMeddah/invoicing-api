import { ApiProperty } from "@nestjs/swagger";

export class MonthlyFluxDto {
  @ApiProperty({ example: '2023-01', description: 'Year and month' })
  month: string;

  @ApiProperty({ example: 1500.50, description: 'Total amount for the period' })
  amount: number;
}