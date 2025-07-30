import { faker } from "@faker-js/faker";
import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn, IsInt, IsNumber, IsNumberString, IsOptional, IsString, Length } from "class-validator";

export class GetStatsDto {
  
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  topClientNb?: number;


  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  topSupplierNb?: number;



  @ApiProperty({ required: false })
  @IsIn(['7days', '30days', '3months','all'])
  period?: string;


  @ApiProperty({
    example: faker.finance.currencyCode(),
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  cabinetCurrency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()  
  firmId?: number;

  

}