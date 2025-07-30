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
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest, Response } from 'express';
import { BuyingInvoiceService } from '../services/buying-invoice.service';
import { ResponseBuyingInvoiceDto } from '../dtos/buying-invoice.response.dto';
import { CreateBuyingInvoiceDto } from '../dtos/buying-invoice.create.dto';
import { DuplicateBuyingInvoiceDto } from '../dtos/buying-invoice.duplicate.dto';
import { UpdateBuyingInvoiceDto } from '../dtos/buying-invoice.update.dto';
import { changesDetector } from 'src/utils/changes-detector';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';


@ApiTags('buying-invoice')
@Controller({
  version: '1',
  path: '/buying-invoice',
})
@UseInterceptors(LogInterceptor)

export class BuyingInvoiceController {
  constructor(
    private readonly buyingInvoiceService: BuyingInvoiceService,
    private readonly userService: UserService
  ) { }

  @UseGuards(PermissionsGuard)
  @Permissions({ all: [PERMISSIONS.BUYING_INVOICE_READ] })
  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseBuyingInvoiceDto[]> {
    return this.buyingInvoiceService.findAll(options);
  }

  @UseGuards(PermissionsGuard)
  @Permissions({ all: [PERMISSIONS.BUYING_INVOICE_READ] })
  @Get('/list')
  @ApiPaginatedResponse(ResponseBuyingInvoiceDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseBuyingInvoiceDto>> {
    return this.buyingInvoiceService.findAllPaginated(query);
  }

  @UseGuards(PermissionsGuard)
  @Permissions({ all: [PERMISSIONS.BUYING_INVOICE_READ] })
  @Get('/seq')

  async findOneBySequential(@Query() params: { sequential: string, firmId: number }): Promise<ResponseBuyingInvoiceDto> {

    try {
      if (!params.sequential || !params.firmId) {
        throw new BadRequestException('Sequential and firmId are required.');
      }
      const invoice = await this.buyingInvoiceService.findOneBySequential(params.sequential, params.firmId);
      if (!invoice) {
        throw new NotFoundException(`No invoice found for sequential: ${params.sequential} and firmId: ${params.firmId}`);
      }
      return invoice;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  @UseGuards(PermissionsGuard)
  @Permissions({
    any: [
      PERMISSIONS.BUYING_INVOICE_READ,
      PERMISSIONS.LOGGS_READ
    ]
  })
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseBuyingInvoiceDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.buyingInvoiceService.findOneByCondition(query);
  }





  @UseGuards(PermissionsGuard)
  @Permissions({ all: [PERMISSIONS.BUYING_INVOICE_READ] })

  @Get('/:id/download')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="quotation.pdf"')
  @LogEvent(EVENT_TYPE.BUYING_INVOICE_PRINTED)
  async generatePdf(
    @Param('id') id: number,
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    const invoice = await this.buyingInvoiceService.findOneById(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = {
      invoiceId: id,
      firmId: invoice.firmId,
      sequential: invoice.sequential,
      performedBy: performedBy.username
    };
    return this.buyingInvoiceService.downloadReferenceDocPdf(id, res);
  }

  @UseGuards(PermissionsGuard)
  @Permissions({
    all: [
      PERMISSIONS.BUYING_INVOICE_CREATE,
      PERMISSIONS.BUYING_INVOICE_READ]
  })
  @Post('')
  @LogEvent(EVENT_TYPE.BUYING_INVOICE_CREATED)
  async save(
    @Body() createBuyingInvoiceDto: CreateBuyingInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingInvoiceDto> {
    const invoice = await this.buyingInvoiceService.save(createBuyingInvoiceDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = {
      invoiceId: invoice.id,
      firmId: invoice.firmId,
      sequential: invoice.sequential,
      performedBy: performedBy.username
    };
    return invoice;
  }

  @UseGuards(PermissionsGuard)
  @Permissions({
    all: [
      PERMISSIONS.BUYING_INVOICE_CREATE,
      PERMISSIONS.BUYING_INVOICE_UPDATE,
      PERMISSIONS.BUYING_INVOICE_READ]
  })
  @Post('/duplicate')
  @LogEvent(EVENT_TYPE.BUYING_INVOICE_DUPLICATED)
  async duplicate(
    @Body() duplicateBuyingInvoiceDto: DuplicateBuyingInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingInvoiceDto> {
    const invoice = await this.buyingInvoiceService.findOneById(duplicateBuyingInvoiceDto.id)
    const duplicateInvoice = await this.buyingInvoiceService.duplicate(duplicateBuyingInvoiceDto);
    const performedBy = await this.userService.findOneById(req.user.id);

    req.logInfo = {
      invoiceId: duplicateBuyingInvoiceDto.id,
      sequential: invoice.sequential,
      duplicateId: duplicateInvoice.id,
      firmId: invoice.firmId,
      performedBy: performedBy.username
    };
    return duplicateInvoice;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards(PermissionsGuard)
  @Permissions({
    all: [
      PERMISSIONS.BUYING_INVOICE_UPDATE,
      PERMISSIONS.BUYING_INVOICE_READ
    ]
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.BUYING_INVOICE_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateBuyingInvoiceDto: UpdateBuyingInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingInvoiceDto> {
    const { createdAt, updatedAt, deletedAt, ...oldInvoice } = await this.buyingInvoiceService.findOneById(id);

    const invoice = await this.buyingInvoiceService.update(id, updateBuyingInvoiceDto);
    const { createdAt: Nc, updatedAt: Nu, deletedAt: Nd, ...newInvoice } = await this.buyingInvoiceService.findOneById(invoice.id);;
    const performedBy = await this.userService.findOneById(req.user.id);

    req.logInfo = {
      invoiceId: id,
      sequential: oldInvoice.sequential || newInvoice.sequential,
      firmId: oldInvoice.firmId,
      changes: changesDetector(oldInvoice, newInvoice),
      performedBy: performedBy.username
    };

    return invoice;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards(PermissionsGuard)
  @Permissions({
    all: [
      PERMISSIONS.BUYING_INVOICE_DELETE,
      PERMISSIONS.BUYING_INVOICE_READ]
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.BUYING_INVOICE_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingInvoiceDto> {
    const deletedInvoice = await this.buyingInvoiceService.softDelete(id);
    const performedBy = await this.userService.findOneById(req.user.id);

    req.logInfo = {
      invoiceId: id,
      firmId: deletedInvoice.firmId,
      sequential: deletedInvoice.sequential,
      performedBy: performedBy.username
    };
    return deletedInvoice;
  }
}
