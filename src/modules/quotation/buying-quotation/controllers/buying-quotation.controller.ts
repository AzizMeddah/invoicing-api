import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  Request,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { Request as ExpressRequest, Response } from 'express';
import { BuyingQuotationService } from '../services/buying-quotation.service';
import { ResponseBuyingQuotationDto } from '../dtos/buying-quotation.response.dto';
import { CreateBuyingQuotationDto } from '../dtos/buying-quotation.create.dto';
import { DuplicateBuyingQuotationDto } from '../dtos/buying-quotation.duplicate.dto';
import { UpdateBuyingQuotationDto } from '../dtos/buying-quotation.update.dto';
import { BuyingInvoiceService } from 'src/modules/invoice/buying-invoice/services/buying-invoice.service';
import { BUYING_QUOTATION_STATUS } from '../enums/buying-quotation-status.enum';
import { create } from 'domain';
import { changesDetector } from 'src/utils/changes-detector';
import { QuotationNotFoundException } from '../../errors/quotation.notfound.error';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('buying-quotation')
@Controller({
  version: '1',
  path: '/buying-quotation',
})
@UseInterceptors(LogInterceptor)
export class BuyingQuotationController {
  constructor(
    private readonly buyingQuotationService: BuyingQuotationService,
    private readonly invoiceService: BuyingInvoiceService,
    private readonly userService: UserService
  ) {}

  @UseGuards( PermissionsGuard)
@Permissions({any:[
  PERMISSIONS.BUYING_QUOTATION_READ,
  PERMISSIONS.BUYING_INVOICE_READ,
]})
  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseBuyingQuotationDto[]> {
    return this.buyingQuotationService.findAll(options);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.BUYING_QUOTATION_READ]})
  @Get('/list')
  @ApiPaginatedResponse(ResponseBuyingQuotationDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseBuyingQuotationDto>> {
    return this.buyingQuotationService.findAllPaginated(query);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.BUYING_QUOTATION_READ]})
  @Get('/seq')
  async findOneBySequential(@Query() params: { sequential: string, firmId: number }): Promise<ResponseBuyingQuotationDto> {
  try{  
  if (!params.sequential || !params.firmId) {
      throw new BadRequestException('Sequential and firmId are required.');
    }
    return this.buyingQuotationService.findOneBySequential(params.sequential, params.firmId);
  }catch(error){
    console.error(error)
  }
  }

  @UseGuards( PermissionsGuard)
@Permissions({any:[
  PERMISSIONS.BUYING_QUOTATION_READ,
  PERMISSIONS.LOGGS_READ,
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
  ): Promise<ResponseBuyingQuotationDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.buyingQuotationService.findOneByCondition(query);

  }




  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.BUYING_QUOTATION_READ]})
  @Get('/:id/download')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="quotation.pdf"')
  @LogEvent(EVENT_TYPE.BUYING_QUOTATION_PRINTED)
  async generatePdf(
    @Param('id') id: number,
    @Res() res: Response,
    @Request() req: ExpressRequest,

  ) {
    const quotation = await this.buyingQuotationService.findOneById(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { 
      quotationId:id , 
      firmId : quotation.firmId ,
      sequential:quotation.sequential,
      performedBy:performedBy.username
    };
    return this.buyingQuotationService.downloadReferenceDocPdf(id,res);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.BUYING_QUOTATION_CREATE,
  PERMISSIONS.BUYING_QUOTATION_READ]})
  @Post('')
  @LogEvent(EVENT_TYPE.BUYING_QUOTATION_CREATED)
  async save(
    @Body() createBuyingQuotationDto: CreateBuyingQuotationDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingQuotationDto> {
    const quotation = await this.buyingQuotationService.save(createBuyingQuotationDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { 
      quotationId: quotation.id ,
      firmId : quotation.firmId ,
      sequential:quotation.sequential,
      performedBy:performedBy.username
    };
    return quotation;
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.BUYING_QUOTATION_CREATE,
  PERMISSIONS.BUYING_QUOTATION_UPDATE,
  PERMISSIONS.BUYING_QUOTATION_READ]})
  @Post('/duplicate')
  @LogEvent(EVENT_TYPE.BUYING_QUOTATION_DUPLICATED)
  async duplicate(
    @Body() duplicateBuyingQuotationDto: DuplicateBuyingQuotationDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingQuotationDto> {
    const quotation= await this.buyingQuotationService.findOneById(duplicateBuyingQuotationDto.id)
    const duplicatedQuotation = await this.buyingQuotationService.duplicate(
      duplicateBuyingQuotationDto,
    );
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { 
      quotationId: duplicateBuyingQuotationDto.id,
      sequential:quotation.sequential,
      duplicateId: duplicatedQuotation.id ,
      firmId : quotation.firmId,
      performedBy:performedBy.username
    };
    return duplicatedQuotation;
  }



  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })

  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.BUYING_QUOTATION_UPDATE,
  PERMISSIONS.BUYING_QUOTATION_READ]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.BUYING_QUOTATION_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateBuyingQuotationDto: UpdateBuyingQuotationDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingQuotationDto> {
    const { createdAt, updatedAt, deletedAt, ...oldQuotation } = await this.buyingQuotationService.findOneById(id);
    const quotation = await this.buyingQuotationService.update(id, updateBuyingQuotationDto);
    const { createdAt: Nc, updatedAt: Nu, deletedAt: Nd, ...newQuotation } = await this.buyingQuotationService.findOneById(quotation.id); ;
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = {
      quotationId:id,
      sequential:oldQuotation.sequential || newQuotation.sequential,
      firmId: oldQuotation.firmId,
      changes: changesDetector(oldQuotation, newQuotation),
      performedBy:performedBy.username
    };
  
    return quotation;  
   
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })

  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.BUYING_QUOTATION_DELETE,
  PERMISSIONS.BUYING_QUOTATION_READ]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.BUYING_QUOTATION_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingQuotationDto> {
    const deletedQuotation = await this.buyingQuotationService.softDelete(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { 
      quotationId:id ,
      firmId: deletedQuotation.firmId,
      sequential:deletedQuotation.sequential,
      performedBy:performedBy.username};
    return deletedQuotation;
  }
 


  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @ApiParam({
    name: 'create',
    type: 'boolean',
    required: false,
  })

  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.BUYING_QUOTATION_UPDATE,
  PERMISSIONS.BUYING_INVOICE_CREATE,
  PERMISSIONS.BUYING_INVOICE_UPDATE,
  PERMISSIONS.BUYING_INVOICE_READ,
]})
  @Put('/invoice/:id/:create')
  @LogEvent(EVENT_TYPE.BUYING_QUOTATION_INVOICED)
  async invoice(
    @Param('id') id: number,
    @Param('create') create: boolean,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingQuotationDto> {
    const quotation = await this.buyingQuotationService.findOneByCondition({
      filter: `id||$eq||${id}`,
      join:
        'quotationMetaData,' +
        'articleQuotationEntries,' +
        `articleQuotationEntries.article,` +
        `articleQuotationEntries.articleQuotationEntryTaxes,` +
        `articleQuotationEntries.articleQuotationEntryTaxes.tax`,
    });
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { 
      quotationId: id,
      quotation_sequential:quotation.sequential,
      invoiceId: null ,
      firmId : req.body.firmId,
    performedBy:performedBy.username
    };
    if (quotation.status === BUYING_QUOTATION_STATUS.Invoiced || create) {
      const invoice = await this.invoiceService.saveFromQuotation(quotation);
      req.logInfo={
        ...req.logInfo,
        invoiceId:invoice?.id,
        invoice_sequential:invoice?.sequential

      }
    }
    await this.buyingQuotationService.updateStatus(id, BUYING_QUOTATION_STATUS.Invoiced);
    return this.buyingQuotationService.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'invoices',
    });
  }
}