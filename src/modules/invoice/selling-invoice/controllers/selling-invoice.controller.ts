import {
  BadRequestException,
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
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';
import { SellingInvoiceService } from '../services/selling-invoice.service';
import { ResponseSellingInvoiceDto } from '../dtos/selling-invoice.response.dto';
import { ResponseSellingInvoiceRangeDto } from '../dtos/selling-invoice-range.response.dto';
import { CreateSellingInvoiceDto } from '../dtos/selling-invoice.create.dto';
import { DuplicateSellingInvoiceDto } from '../dtos/selling-invoice.duplicate.dto';
import { InvoiceSequence } from '../interfaces/invoice-sequence.interface';
import { UpdateSellingInvoiceDto } from '../dtos/selling-invoice.update.dto';
import { UpdateInvoiceSequenceDto } from '../dtos/invoice-seqence.update.dto';
import { fi } from '@faker-js/faker';
import { changesDetector } from 'src/utils/changes-detector';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';


@ApiTags('selling-invoice')
@Controller({
  version: '1',
  path: '/selling-invoice',
})
@UseInterceptors(LogInterceptor)
@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_INVOICE_READ]})
export class SellingInvoiceController {
  constructor(
    private readonly sellingInvoiceService: SellingInvoiceService,
    private readonly userService: UserService
  ) {}

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseSellingInvoiceDto[]> {
    return this.sellingInvoiceService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseSellingInvoiceDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseSellingInvoiceDto>> {
    return this.sellingInvoiceService.findAllPaginated(query);
  }

  @Get('/sequential-range/:id')
  async findInvoicesByRange(
    @Param('id') id: number,
  ): Promise<ResponseSellingInvoiceRangeDto> {
    return this.sellingInvoiceService.findInvoicesByRange(id);
  }
  @Get('/seq')
  async findOneBySequential(

  @Query('sequential') sequential: string
  ): Promise<ResponseSellingInvoiceDto> {
    const sellinginvoice = await this.sellingInvoiceService.findOneBySequential(sequential);

    if (!sellinginvoice) {
      // Return 404 with JSON (not empty)
      throw new NotFoundException({
        statusCode: 404,
        message: `No invoice found for sequential: ${sequential}`,
        error: 'Not Found'
      });
    }
    return sellinginvoice; // Ensure this is always a valid ResponseSellingInvoiceDto
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
  ): Promise<ResponseSellingInvoiceDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.sellingInvoiceService.findOneByCondition(query);
  }

  @Get('/:id/download')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="invoice.pdf"')
  @LogEvent(EVENT_TYPE.SELLING_INVOICE_PRINTED)
  async generatePdf(
    @Param('id') id: number,
    @Query() query: { template: string },
    @Request() req: ExpressRequest,
  ) {
    const invoice = await this.sellingInvoiceService.findOneById(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { 
      invoiceId:id , 
      firmId : invoice.firmId ,
      sequential:invoice.sequential,
      performedBy:performedBy.username
    };
    return this.sellingInvoiceService.downloadPdf(id, query.template);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_INVOICE_CREATE]})
  @Post('')
  @LogEvent(EVENT_TYPE.SELLING_INVOICE_CREATED)
  async save(
    @Body() createSellingInvoiceDto: CreateSellingInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingInvoiceDto> {
    const invoice = await this.sellingInvoiceService.save(createSellingInvoiceDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { 
      invoiceId: invoice.id ,
      firmId : invoice.firmId ,
      sequential:invoice.sequential,
      performedBy:performedBy.username
    };
    return invoice;
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_INVOICE_CREATE]})
  @Post('/duplicate')
  @LogEvent(EVENT_TYPE.SELLING_INVOICE_DUPLICATED)
  async duplicate(
    @Body() duplicateSellingInvoiceDto: DuplicateSellingInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingInvoiceDto> {
    const  invoice = await this.sellingInvoiceService.findOneById(duplicateSellingInvoiceDto.id)
    const duplicatedInvoice = await this.sellingInvoiceService.duplicate(
      duplicateSellingInvoiceDto,
    );
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = {
      invoiceId: invoice.id,
      invoice_sequential:invoice.sequential,
      duplicateId: duplicatedInvoice.id ,
      duplicate_sequential: duplicatedInvoice.sequential ,
      firmId: invoice.firmId ,
      performedBy:performedBy.username
    };
    return duplicatedInvoice;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SEQUENTIAL_UPDATE]})
  @Put('/update-invoice-sequences')
  async updateInvoiceSequences(
    @Body() updatedSequenceDto: UpdateInvoiceSequenceDto,
  ): Promise<InvoiceSequence> {
    return this.sellingInvoiceService.updateInvoiceSequence(updatedSequenceDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_INVOICE_UPDATE]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.SELLING_INVOICE_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateSellingInvoiceDto: UpdateSellingInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingInvoiceDto> {
    const { createdAt, updatedAt, deletedAt, ...oldInvoice } = await this.sellingInvoiceService.findOneById(id);

    const invoice = await this.sellingInvoiceService.update(id, updateSellingInvoiceDto);
    const { createdAt: Nc, updatedAt: Nu, deletedAt: Nd, ...newInvoice } = await this.sellingInvoiceService.findOneById(invoice.id); ;
    const performedBy = await this.userService.findOneById(req.user.id);

    req.logInfo = {
      invoiceId:id,
      sequential:oldInvoice.sequential,
      firmId: oldInvoice.firmId,
      changes: changesDetector(oldInvoice, newInvoice),
      performedBy:performedBy.username
    };

    return invoice;  
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_INVOICE_DELETE]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.SELLING_INVOICE_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingInvoiceDto> {
    const deletedInvoice= await this.sellingInvoiceService.softDelete(id);
    const performedBy = await this.userService.findOneById(req.user.id);

    req.logInfo = { 
      invoiceId:id ,
      firmId: deletedInvoice.firmId,
      sequential:deletedInvoice.sequential,
      performedBy:performedBy.username
    };
    return deletedInvoice
  }
}
