import { ApiProperty } from "@nestjs/swagger";

export class TopFirmDto {

  @ApiProperty({ example: '0147', description: 'Id de la firme' })
    id: number;

    @ApiProperty({ example: 'Entreprise ABC', description: 'Nom de la firme' })
    name: string;

    @ApiProperty({ example: 15000.50, description: 'Montant total des transactions' })
    amount: number;
  }