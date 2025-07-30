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
  UseInterceptors,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { TaxWithholdingService } from '../services/tax-withholding.service';
import { ResponseTaxWithholdingDto } from '../dtos/tax-withholding.response.dto';
import { CreateTaxWithholdingDto } from '../dtos/tax-withholding.create.dto';
import { UpdateTaxWithholdingDto } from '../dtos/tax-withholding.update.dto';
import { Request as ExpressRequest } from 'express';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';
import { TaxWithholdingAlreadyExistsException } from '../errors/tax-withholding.alreadyexists.error';


@ApiTags('tax-withholding')
@Controller({
  version: '1',
  path: '/tax-withholding',
})
@UseInterceptors(LogInterceptor)
export class TaxWithholdingController {
  constructor(
    private readonly taxWithholdingService: TaxWithholdingService,
    private readonly userService: UserService

  ) {}


@UseGuards( PermissionsGuard)
@Permissions({any:[
  PERMISSIONS.TAX_WITHHOLDING_READ,
  PERMISSIONS.SELLING_INVOICE_READ,
  PERMISSIONS.BUYING_INVOICE_READ
]})
  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseTaxWithholdingDto[]> {
    return this.taxWithholdingService.findAll(options);
  }


@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.TAX_WITHHOLDING_READ]})
  @Get('/list')
  @ApiPaginatedResponse(ResponseTaxWithholdingDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseTaxWithholdingDto>> {
    return this.taxWithholdingService.findAllPaginated(query);
  }


@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.TAX_WITHHOLDING_READ]})
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseTaxWithholdingDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.taxWithholdingService.findOneByCondition(query);
  }

  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.TAX_WITHHOLDING_CREATE,PERMISSIONS.TAX_WITHHOLDING_READ]})  
  @Post('')
  @LogEvent(EVENT_TYPE.TAX_WITHHOLDING_CREATED)
  async save(
    @Body() createTaxWithholdingDto: CreateTaxWithholdingDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseTaxWithholdingDto> {
    let tax = await this.taxWithholdingService.findOneByCondition({
      filter: `label||$eq||${createTaxWithholdingDto.label}`,
    });
    if (tax) {
      throw new TaxWithholdingAlreadyExistsException()
    }
    tax = await this.taxWithholdingService.save(createTaxWithholdingDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: tax.id , label:tax.label ,performedBy:performedBy.username };
    return tax;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.TAX_WITHHOLDING_UPDATE,PERMISSIONS.TAX_WITHHOLDING_READ]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.TAX_WITHHOLDING_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateTaxWithholdingDto: UpdateTaxWithholdingDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseTaxWithholdingDto> {
     let existingLabel = await this.taxWithholdingService.findOneByCondition({
      filter: `label||$eq||${updateTaxWithholdingDto.label};id||!$eq||${id}`,
    });
    if (existingLabel) {
      throw new TaxWithholdingAlreadyExistsException()
    }
    const oldTax = await this.taxWithholdingService.findOneById(id)
    const tax = await this.taxWithholdingService.update(
      id,
      updateTaxWithholdingDto,
    );
    if (!tax) {
      throw new NotFoundException(`Tax withholding with ID ${id} not found`);
    }
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: tax.id , label:oldTax.label,performedBy:performedBy.username };
    return tax;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.TAX_WITHHOLDING_DELETE,PERMISSIONS.TAX_WITHHOLDING_READ]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.TAX_WITHHOLDING_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseTaxWithholdingDto> {

    const tax = await  this.taxWithholdingService.softDelete(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: tax.id , label:tax.label ,performedBy:performedBy.username };
    return tax
  }
}
