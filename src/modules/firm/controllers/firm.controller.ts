import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Put,
  UseInterceptors,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { FirmService } from '../services/firm.service';
import { ResponseFirmDto } from '../dtos/firm.response.dto';
import { CreateFirmDto } from '../dtos/firm.create.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { UpdateFirmDto } from '../dtos/firm.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';


@ApiTags('firm')
@Controller({
  version: '1',
  path: '/firm',
})
@UseInterceptors(LogInterceptor)



export class FirmController {
  constructor(
    private readonly firmService: FirmService,
    private readonly userService: UserService


  ) {}

  @UseGuards( PermissionsGuard)
  @Permissions({any:[
    PERMISSIONS.FIRM_READ ,
    PERMISSIONS.SELLING_QUOTATION_READ,
    PERMISSIONS.SELLING_INVOICE_READ,
    PERMISSIONS.SELLING_PAYMENT_READ,
    PERMISSIONS.BUYING_QUOTATION_READ,
    PERMISSIONS.BUYING_INVOICE_READ,
    PERMISSIONS.BUYING_PAYMENT_READ,

    
    ]})
  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseFirmDto[]> {
    return await this.firmService.findAll(options);
  }
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.FIRM_READ]})
  @Get('/list')
  @ApiPaginatedResponse(ResponseFirmDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseFirmDto>> {
    return await this.firmService.findAllPaginated(query);
  }

  @UseGuards( PermissionsGuard)
  @Permissions({any:[
    PERMISSIONS.FIRM_READ,
    PERMISSIONS.SELLING_QUOTATION_READ,
    PERMISSIONS.SELLING_INVOICE_READ,
  ]})
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseFirmDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return await this.firmService.findOneByCondition(query);
  }

  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.FIRM_CREATE,PERMISSIONS.FIRM_READ,]})
  @Post('')
  @LogEvent(EVENT_TYPE.FIRM_CREATED)
  async save(
    @Body() createFirmDto: CreateFirmDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseFirmDto> {
    const firm = await this.firmService.save(createFirmDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = {firmId: firm.id ,firm_name:firm.name,performedBy:performedBy.username};
    return firm;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.FIRM_UPDATE,PERMISSIONS.FIRM_READ,]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.FIRM_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateFirmDto: UpdateFirmDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseFirmDto> {
  
    const oldFirm = await this.firmService.findOneById(id);  
    const newFirm = await this.firmService.update(id, updateFirmDto);
  
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = {
      id,
      firm_name:oldFirm.name,
      performedBy:performedBy.username
    };
  
    return newFirm;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.FIRM_DELETE,PERMISSIONS.FIRM_READ,]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.FIRM_DELETED)
  async delete(
    @Param('id') id: number,
    @Body() body:{password: string},
    @Request() req: ExpressRequest,
  ): Promise<ResponseFirmDto> {
    const firm= await this.firmService.softDelete(id,body.password,req.user.id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = {firmId: firm.id ,firm_name:firm.name,performedBy:performedBy.username};
    return firm;
  }
}
