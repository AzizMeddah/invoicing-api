import { ApiProperty } from "@nestjs/swagger";

export class StatusStatsDto {
  @ApiProperty({ example: 'validated' })
  status: string;

  @ApiProperty({ example: 20 })
  count: number;
}