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
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { InterlocutorService } from '../services/interlocutor.service';
import { ResponseInterlocutorDto } from '../dtos/interlocutor.response.dto';
import { CreateInterlocutorDto } from '../dtos/interlocutor.create.dto';
import { UpdateInterlocutorDto } from '../dtos/interlocutor.update.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';
import { FirmService } from 'src/modules/firm/services/firm.service';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('interlocutor')
@Controller({
  version: '1',
  path: '/interlocutor',
})
@UseInterceptors(LogInterceptor)
@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.INTERLOCUTOR_READ]})
export class InterlocutorController {
  constructor(
    private readonly interlocutorService: InterlocutorService,
    private readonly firmService: FirmService,
    private readonly userService: UserService
  
  ) {}

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseInterlocutorDto[]> {
    return await this.interlocutorService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseInterlocutorDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseInterlocutorDto>> {
    return await this.interlocutorService.findAllPaginated(query);
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseInterlocutorDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    query.join? query.join+=',firmsToInterlocutor':query.join='firmsToInterlocutor'
    return await this.interlocutorService.findOneByCondition(query);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.INTERLOCUTOR_CREATE,PERMISSIONS.FIRM_READ,PERMISSIONS.FIRM_UPDATE]})
  @Post('')
  @LogEvent(EVENT_TYPE.INTERLOCUTOR_CREATED)
  async save(
    @Body() createInterlocutorDto: CreateInterlocutorDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseInterlocutorDto> {
    const interlocutor = await this.interlocutorService.save(
      createInterlocutorDto,
    );
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { 
      id: interlocutor.id ,
      name:interlocutor.name,
      surname:interlocutor.surname,
      performedBy:performedBy.username
    
    };
    return interlocutor;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.INTERLOCUTOR_UPDATE,PERMISSIONS.FIRM_READ,PERMISSIONS.FIRM_UPDATE]})
  @Post('/promote/:id/:firmId')
  @LogEvent(EVENT_TYPE.INTERLOCUTOR_PROMOTED)
  async promote(
    @Param('id') id: number,
    @Param('firmId') firmId: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseInterlocutorDto> {
    const demoted = await this.interlocutorService.demote(firmId);
    const promoted = await this.interlocutorService.promote(id, firmId);
    const firm= await this.firmService.findOneById(firmId)
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = {

      demoted:demoted.id,
      demoted_name:demoted.name,
      demoted_surname:demoted.surname,

      promoted: promoted.id,
      promoted_name:promoted.name,
      promoted_surname:promoted.surname,

      firmId: firmId,
      firm_name:firm.name,

      performedBy:performedBy.username
    };
    return await this.interlocutorService.findOneById(id);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.INTERLOCUTOR_UPDATE,PERMISSIONS.FIRM_READ]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.INTERLOCUTOR_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateInterlocutorDto: UpdateInterlocutorDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseInterlocutorDto> {
    const oldInterlocutor  = await this.interlocutorService.findOneById(id);
    const newInterlocutor = await this.interlocutorService.update(id, updateInterlocutorDto);
    const performedBy = await this.userService.findOneById(req.user.id);

    req.logInfo = {
      id,
      name: oldInterlocutor.name,
      surname:oldInterlocutor.surname,
      performedBy:performedBy.username,
    };
  
    return newInterlocutor;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.INTERLOCUTOR_DELETE]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.INTERLOCUTOR_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseInterlocutorDto> {
    const interlocutor =await this.interlocutorService.softDelete(id);
    const performedBy = await this.userService.findOneById(req.user.id);

    req.logInfo = { 
      id: interlocutor.id ,
      name:interlocutor.name,
      surname:interlocutor.surname,
      performedBy:performedBy.username
    };
    return  interlocutor
  }
}
