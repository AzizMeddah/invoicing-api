import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
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
import { Request as ExpressRequest } from 'express';
import { SellingQuotationService } from '../services/selling-quotation.service';
import { ResponseSellingQuotationDto } from '../dtos/selling-quotation.response.dto';
import { CreateSellingQuotationDto } from '../dtos/selling-quotation.create.dto';
import { DuplicateSellingQuotationDto } from '../dtos/selling-quotation.duplicate.dto';
import { QuotationSequence } from '../interfaces/quotation-sequence.interface';
import { UpdateSellingQuotationDto } from '../dtos/selling-quotation.update.dto';
import { SellingInvoiceService } from 'src/modules/invoice/selling-invoice/services/selling-invoice.service';
import { UpdateQuotationSequenceDto } from '../dtos/quotation-seqence.update.dto';
import { SELLING_QUOTATION_STATUS } from '../enums/selling-quotation-status.enum';
import { changesDetector } from 'src/utils/changes-detector';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';


@ApiTags('selling-quotation')
@Controller({
  version: '1',
  path: '/selling-quotation',
})
@UseInterceptors(LogInterceptor)

export class SellingQuotationController {
  constructor(
    private readonly sellingQuotationService: SellingQuotationService,
    private readonly invoiceService: SellingInvoiceService,
    private readonly userService: UserService
  ) {}
  @UseGuards( PermissionsGuard)
  @Permissions({all:[
    PERMISSIONS.SELLING_QUOTATION_READ,
    PERMISSIONS.SELLING_INVOICE_READ,
  ]})
  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseSellingQuotationDto[]> {
    return this.sellingQuotationService.findAll(options);
  }
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.SELLING_QUOTATION_READ]})
  @Get('/list')
  @ApiPaginatedResponse(ResponseSellingQuotationDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseSellingQuotationDto>> {
    return this.sellingQuotationService.findAllPaginated(query);
  }
  @Get('/seq')
  async findOneBySequential(
  @Query('sequential') sequential: string
    ): Promise<ResponseSellingQuotationDto> {
    const sellingquotation = await this.sellingQuotationService.findOneBySequential(sequential);

    if (!sellingquotation) {
      // Return 404 with JSON (not empty)
      throw new NotFoundException({
        statusCode: 404,
        message: `No quotation found for sequential: ${sequential}`,
        error: 'Not Found'
      });
    }
    console.log('sellingquotation:', sellingquotation);
    return sellingquotation; // Ensure this is always a valid ResponseSellingquotationDto
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
  ): Promise<ResponseSellingQuotationDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.sellingQuotationService.findOneByCondition(query);
  }
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.SELLING_QUOTATION_READ]})
  @Get('/:id/download')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="quotation.pdf"')
  @LogEvent(EVENT_TYPE.SELLING_QUOTATION_PRINTED)
  async generatePdf(
    @Param('id') id: number,
    @Query() query: { template: string },
    @Request() req: ExpressRequest,
  ) {
    const quotation = await this.sellingQuotationService.findOneById(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { 
      quotationId:id , 
      firmId : quotation.firmId ,
      sequential:quotation.sequential,
      performedBy:performedBy.username
    };
    return this.sellingQuotationService.downloadPdf(id, query.template);
  }


@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_QUOTATION_CREATE,PERMISSIONS.SELLING_QUOTATION_READ]})
  @Post('')
  @LogEvent(EVENT_TYPE.SELLING_QUOTATION_CREATED)
  async save(
    @Body() createSellingQuotationDto: CreateSellingQuotationDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingQuotationDto> {
    const quotation = await this.sellingQuotationService.save(createSellingQuotationDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { 
      quotationId: quotation.id ,
      firmId : quotation.firmId ,
      sequential:quotation.sequential,
      performedBy:performedBy.username,
    };
    return quotation;
  }


@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_QUOTATION_CREATE,PERMISSIONS.SELLING_QUOTATION_READ]})
  @Post('/duplicate')
  @LogEvent(EVENT_TYPE.SELLING_QUOTATION_DUPLICATED)
  async duplicate(
    @Body() duplicateSellingQuotationDto: DuplicateSellingQuotationDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingQuotationDto> {

    const  quotation = await this.sellingQuotationService.findOneById(duplicateSellingQuotationDto.id)
    const duplicatedQuotation = await this.sellingQuotationService.duplicate(
      duplicateSellingQuotationDto,
    );
    const performedBy = await this.userService.findOneById(req.user.id);

    req.logInfo = {
      quotationId: quotation.id,
      quotation_sequential:quotation.sequential,
      duplicateId: duplicatedQuotation.id ,
      duplicate_sequential: duplicatedQuotation.sequential ,
      firmId: quotation.firmId ,
      performedBy:performedBy.username,
    };
    return duplicatedQuotation;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SEQUENTIAL_UPDATE,PERMISSIONS.SELLING_QUOTATION_READ]})
  @Put('/update-quotation-sequences')

  async updateQuotationSequences(
    @Body() updatedSequenceDto: UpdateQuotationSequenceDto,
  ): Promise<QuotationSequence> {
    return this.sellingQuotationService.updateQuotationSequence(updatedSequenceDto);
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
  PERMISSIONS.SELLING_QUOTATION_READ,
  PERMISSIONS.SELLING_QUOTATION_UPDATE,
  PERMISSIONS.SELLING_INVOICE_CREATE,
  PERMISSIONS.SELLING_INVOICE_UPDATE,
  PERMISSIONS.SELLING_INVOICE_READ,
]})
  @Put('/invoice/:id/:create')
  @LogEvent(EVENT_TYPE.SELLING_QUOTATION_INVOICED)
  async invoice(
    @Param('id') id: number,
    @Param('create') create: boolean,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingQuotationDto> {
    const quotation = await this.sellingQuotationService.findOneByCondition({
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
      performedBy:performedBy.username,};
    if (quotation.status === SELLING_QUOTATION_STATUS.Invoiced || create) {
      const invoice = await this.invoiceService.saveFromQuotation(quotation);
      req.logInfo={
        ...req.logInfo,
        invoiceId:invoice.id,
        invoice_sequential:invoice.sequential

      }
    }
    await this.sellingQuotationService.updateStatus(id, SELLING_QUOTATION_STATUS.Invoiced);

    return this.sellingQuotationService.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'invoices',
    });
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_QUOTATION_UPDATE,PERMISSIONS.SELLING_QUOTATION_READ]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.SELLING_QUOTATION_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateSellingQuotationDto: UpdateSellingQuotationDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingQuotationDto> {
    const { createdAt, updatedAt, deletedAt, ...oldQuotation } = await this.sellingQuotationService.findOneById(id);
    const quotation = await this.sellingQuotationService.update(id, updateSellingQuotationDto);
    const { createdAt: Nc, updatedAt: Nu, deletedAt: Nd, ...newQuotation } = await this.sellingQuotationService.findOneById(quotation.id); 
    const performedBy = await this.userService.findOneById(req.user.id);

    req.logInfo = {
      quotationId:id,
      sequential:oldQuotation.sequential,
      firmId: oldQuotation.firmId,
      changes: changesDetector(oldQuotation, newQuotation),
      performedBy:performedBy.username,
    };
  
    return quotation;  
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_QUOTATION_DELETE,PERMISSIONS.SELLING_QUOTATION_READ]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.SELLING_QUOTATION_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingQuotationDto> {
    const deletedQuotation = await this.sellingQuotationService.softDelete(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { quotationId:id ,firmId: deletedQuotation.firmId,sequential:deletedQuotation.sequential,performedBy:performedBy.username};
    return deletedQuotation;
  }

}
