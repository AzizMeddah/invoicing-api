import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ResponseRoleDto } from 'src/modules/role/dtos/role.response.dto';
import { RoleEntity } from 'src/modules/role/repositories/entities/role.entity';

@Exclude()
export class ResponseUserDto {
  @ApiProperty({ type: Number })
  @Expose()
  id?: number;

  @ApiProperty({ type: String })
  @Expose()
  username?: string;

  @ApiProperty({ type: String })
  @Expose()
  email?: string;

  @ApiProperty({ type: String, required: false })
  @Expose()
  firstName?: string;

  @ApiProperty({ type: String, required: false })
  @Expose()
  lastName?: string;

  @ApiProperty({ type: String, required: false })
  @Expose()
  dateOfBirth?: Date;

  //@ApiProperty({ type: String, required: false })
  //refreshToken?: string;

  @ApiProperty({ type: Number })
  @Expose()
  pictureId?: number;

  @ApiProperty({ type:Boolean  })
  @Expose()
  isActive: boolean;

  @ApiProperty({ type:Boolean  })
  @Expose()
  requirePasswordChange: boolean;

  @Expose()
  @Type(() => ResponseRoleDto)
  role: ResponseRoleDto;
  
    @ApiProperty({ type: Number })
    @Expose()
    roleId: number;

}
