import {
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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';

import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';
import { SellingPaymentService } from '../services/selling-payment.service';
import { ResponseSellingPaymentDto } from '../dtos/selling-payment.response.dto';
import { UpdateSellingPaymentDto } from '../dtos/selling-payment.update.dto';
import { CreateSellingPaymentDto } from '../dtos/selling-payment.create.dto';
import { changesDetector } from 'src/utils/changes-detector';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';


@ApiTags('selling-payment')
@Controller({
  version: '1',
  path: '/selling-payment',
})
@UseInterceptors(LogInterceptor)
@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_PAYMENT_READ]})
export class SellingPaymentController {
  constructor(
    private readonly sellingPaymentService: SellingPaymentService,
    private readonly userService: UserService
  ) {}

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseSellingPaymentDto[]> {
    return this.sellingPaymentService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseSellingPaymentDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseSellingPaymentDto>> {
    return this.sellingPaymentService.findAllPaginated(query);
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
  ): Promise<ResponseSellingPaymentDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.sellingPaymentService.findOneByCondition(query);
  }


  @Get('/:id/download')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="invoice.pdf"')
  @LogEvent(EVENT_TYPE.SELLING_PAYMENT_PRINTED)
  async generatePdf(
    @Param('id') id: number,
    @Query() query,
    @Request() req: ExpressRequest,
  ) {
    const downloadedPayment = await this.sellingPaymentService.findOneById(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { PaymentId: id , firmId: downloadedPayment.firmId,performedBy:performedBy.username};

    return this.sellingPaymentService.downloadPdf(id,query.cabinet, query.template);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_PAYMENT_CREATE]})
  @Post('')
  @LogEvent(EVENT_TYPE.SELLING_PAYMENT_CREATED)
  async save(
    @Body() createPaymentDto: CreateSellingPaymentDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingPaymentDto> {
    const payment = await this.sellingPaymentService.save(createPaymentDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { PaymentId: payment.id , firmId: payment.firmId ,performedBy:performedBy.username};
    return payment;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_PAYMENT_UPDATE]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.SELLING_PAYMENT_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateSellingPaymentDto: UpdateSellingPaymentDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingPaymentDto> {
const { createdAt, updatedAt, deletedAt, ...oldPayment } = await this.sellingPaymentService.findOneById(id);

    const payment = await this.sellingPaymentService.update(id, updateSellingPaymentDto);
    const { createdAt: Nc, updatedAt: Nu, deletedAt: Nd, ...newPayment } = await this.sellingPaymentService.findOneById(payment.id); ;
    const performedBy = await this.userService.findOneById(req.user.id);

    req.logInfo = {
      PaymentId:id,
      firmId: oldPayment.firmId,
      changes: changesDetector(oldPayment, newPayment),
      performedBy: performedBy.username,
    };

    return payment;  
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.SELLING_PAYMENT_DELETE]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.SELLING_PAYMENT_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseSellingPaymentDto> {
    const deletedPayment = await this.sellingPaymentService.softDelete(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { PaymentId:id , firmId: deletedPayment.firmId,performedBy:performedBy.username};
    return deletedPayment;
  }
}
