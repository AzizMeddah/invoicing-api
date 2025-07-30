import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  NotFoundException,
  Param,
  Body,
  ConflictException,
  Query,
  Request,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { TaxService } from '../services/tax.service';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { CreateTaxDto } from '../dtos/tax.create.dto';
import { UpdateTaxDto } from '../dtos/tax.update.dto';
import { ResponseTaxDto } from '../dtos/tax.response.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { Request as ExpressRequest } from 'express';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';
import { TaxAlreadyExistsException } from '../errors/tax.alreadyexists.error';

@ApiTags('tax')
@Controller({
  version: '1',
  path: '/tax',
})
@UseInterceptors(LogInterceptor)

export class TaxController {
  constructor(
    private readonly taxService: TaxService,
    private readonly userService: UserService,

  ) {}

  @UseGuards( PermissionsGuard)
  @Permissions({any:[
    PERMISSIONS.TAX_READ,
    PERMISSIONS.SELLING_QUOTATION_READ,
    PERMISSIONS.SELLING_INVOICE_READ,
    PERMISSIONS.BUYING_QUOTATION_READ,
    PERMISSIONS.BUYING_INVOICE_READ

  ]})
  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseTaxDto[]> {
    return await this.taxService.findAll(options);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.TAX_READ]})
  @Get('/list')
  @ApiPaginatedResponse(ResponseTaxDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseTaxDto>> {
    return await this.taxService.findAllPaginated(query);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.TAX_READ]})
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseTaxDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return await this.taxService.findOneByCondition(query);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.TAX_CREATE,PERMISSIONS.TAX_READ]})
  @Post('')
  @LogEvent(EVENT_TYPE.TAX_CREATED)
  async save(
    @Body() createTaxDto: CreateTaxDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseTaxDto> {
    let tax = await this.taxService.findOneByCondition({
      filter: `label||$eq||${createTaxDto.label}`,
    });
    if (tax) {
      throw new TaxAlreadyExistsException();

    }
    tax = await this.taxService.save(createTaxDto);
    
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: tax.id , label:tax.label , performedBy:performedBy.username};
    return tax;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.TAX_UPDATE,PERMISSIONS.TAX_READ]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.TAX_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateTaxDto: UpdateTaxDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseTaxDto> {
     let existingLabel = await this.taxService.findOneByCondition({
      filter: `label||$eq||${updateTaxDto.label};id||!$eq||${id}`,
    });
    if (existingLabel) {
      throw new TaxAlreadyExistsException();

    }

    const oldTax =  await this.taxService.findOneById(id)
    const tax = await this.taxService.update(id, updateTaxDto);
    if (!tax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: tax.id , label:oldTax.label ,performedBy:performedBy.username };
    return tax;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.TAX_DELETE,PERMISSIONS.TAX_READ]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.TAX_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseTaxDto> {
    const tax = await this.taxService.softDelete(id);
    if (!tax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: tax.id , label:tax.label ,performedBy:performedBy.username };
    return tax;
  }
}
