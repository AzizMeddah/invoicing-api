import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {


  @ApiProperty({ type: String })
  @IsString()
  currentPassword: string;

  @ApiProperty({ type: String })
  @IsString()
  @MinLength(8)
  newPassword: string;


}
