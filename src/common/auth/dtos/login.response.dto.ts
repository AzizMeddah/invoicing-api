import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseLoginDto {
  @ApiProperty({ type: String })
  @IsString()
  access_token: string;

  @ApiProperty({ type: String })
  @IsString()
  refresh_token: string;

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  permissions: string[];

  @ApiProperty({ type:Boolean  })
  @IsBoolean()
  requirePasswordChange?: boolean;
}
