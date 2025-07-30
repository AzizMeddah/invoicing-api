import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PermissionService } from '../services/permission.service';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { ResponsePermissionDto } from '../dtos/permission.response.dto';
import { CreatePermissionDto } from '../dtos/permission.create.dto';
import { UpdatePermissionDto } from '../dtos/permission.update.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';

@ApiTags('permission')
@Controller({
  version: '1',
  path: '/permission',
})


export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards( PermissionsGuard)
@Permissions({any:[
  PERMISSIONS.PERMISSION_READ,
  PERMISSIONS.ROLE_READ,]})
  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponsePermissionDto[]> {
    return await this.permissionService.findAll(options);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.PERMISSION_READ]})
  @Get('/list')
  @ApiPaginatedResponse(ResponsePermissionDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponsePermissionDto>> {
    return this.permissionService.findAllPaginated(query);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.PERMISSION_READ]})
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponsePermissionDto> {
    if (query.filter) query.filter += `,id||$eq||${id}`;
    else query.filter = `id||$eq||${id}`;
    return await this.permissionService.findOneByCondition(query);
  }


}
