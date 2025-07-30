import { ApiProperty } from '@nestjs/swagger';

export class ResponseUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ type: String })
  slug: string;

  filename: any;

  relativePath: any;

  mimetype: any;

  @ApiProperty({type: Number })
  size: number;
}
