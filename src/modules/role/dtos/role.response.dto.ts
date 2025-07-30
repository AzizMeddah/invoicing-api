import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ResponsePermissionDto } from 'src/modules/permission/dtos/permission.response.dto';

export class ResponseRoleDto {
  @ApiProperty({ type: Number })
  @Expose()

  id: number;

  @ApiProperty({ type: String })
  @Expose()
  label?: string;

  @ApiProperty({
    type: String,
  })
  @Expose()
  description?: string;

  @ApiProperty({ type: Array<ResponsePermissionDto> })
  @Expose()

  permissions?: ResponsePermissionDto[];
}
