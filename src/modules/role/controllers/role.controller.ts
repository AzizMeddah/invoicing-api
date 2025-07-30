import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { UpdateRoleDto } from '../dtos/role.update.dto';
import { ResponseRoleDto } from '../dtos/role.response.dto';
import { CreateRoleDto } from '../dtos/role.create.dto';
import { RoleService } from '../services/role.service';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';
import { RoleRestrictedDeleteException } from '../errors/role.restricted-delete.error';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';
@ApiTags('role')
@Controller({
  version: '1',
  path: '/role',
})
@UseInterceptors(LogInterceptor)

export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService
  ) {}

  @UseGuards( PermissionsGuard)
@Permissions({any:[
  PERMISSIONS.ROLE_READ,
  PERMISSIONS.USER_READ]})
  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseRoleDto[]> {
    return this.roleService.findAll(options);
  }
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.ROLE_READ]})
  @Get('/list')
  @ApiPaginatedResponse(ResponseRoleDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseRoleDto>> {
    return this.roleService.findAllPaginated(query);
  }
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.ROLE_READ]})
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseRoleDto> {
    if (query.filter) query.filter += `,id||$eq||${id}`;
    else query.filter = `id||$eq||${id}`;
    return this.roleService.findOneByCondition(query);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.ROLE_CRETE,
  PERMISSIONS.ROLE_UPDATE,
  PERMISSIONS.ROLE_READ]})
  @Post('/duplicate/:id')
  @LogEvent(EVENT_TYPE.ROLE_DUPLICATED)
  async duplicate(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseRoleDto> {

    const oldRole= await this.roleService.findOneById(id)
    const role= await this.roleService.duplicate(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { 
      id ,
      role_label:oldRole.label,
      duplicate_label:role.label,
      performedBy:performedBy.username,
    };
    return role;

  }

  @UseGuards( PermissionsGuard)
  @Permissions({all:[
    PERMISSIONS.ROLE_CRETE,
    PERMISSIONS.ROLE_READ]})
  @Post('')
  @LogEvent(EVENT_TYPE.ROLE_CREATED)
  async save(
    @Body() createRoleDto: CreateRoleDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseRoleDto> {
    const role = await this.roleService.save(createRoleDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: role.id ,label:role.label,performedBy:performedBy.username };
    return role;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
  @Permissions({all:[
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_READ]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.ROLE_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseRoleDto> {


    const oldRole = await this.roleService.findOneById(id);
    const newRole = await this.roleService.update(id, updateRoleDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = {
      id,
      label: oldRole.label,
      performedBy: performedBy.username,
    };
    return  newRole
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
  @Permissions({all:[
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.ROLE_READ]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.ROLE_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseRoleDto> {

    const role= await this.roleService.findOneById(id)
    if (role.isDeletionRestricted) {
      throw new RoleRestrictedDeleteException();
    }
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id,label:role.label,performedBy:performedBy.username };
    return   await  this.roleService.softDelete(id);

  }
}
