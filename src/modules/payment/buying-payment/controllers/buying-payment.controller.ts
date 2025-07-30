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
import { BuyingPaymentService } from '../services/buying-payment.service';
import { ResponseBuyingPaymentDto } from '../dtos/buying-payment.response.dto';
import { UpdateBuyingPaymentDto } from '../dtos/buying-payment.update.dto';
import { CreateBuyingPaymentDto } from '../dtos/buying-payment.create.dto';
import { de, fr } from '@faker-js/faker';
import { changesDetector } from 'src/utils/changes-detector';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('buying-payment')
@Controller({
  version: '1',
  path: '/buying-payment',
})
@UseInterceptors(LogInterceptor)
@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.BUYING_PAYMENT_READ]})
export class BuyingPaymentController {
  constructor(
    private readonly buyingPaymentService: BuyingPaymentService,
    private readonly userService: UserService
  ) {}

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseBuyingPaymentDto[]> {
    return this.buyingPaymentService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseBuyingPaymentDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseBuyingPaymentDto>> {
    return this.buyingPaymentService.findAllPaginated(query);
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
  ): Promise<ResponseBuyingPaymentDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.buyingPaymentService.findOneByCondition(query);
  }

    @Get('/:id/download')
    @Header('Content-Type', 'application/json')
    @Header('Content-Disposition', 'attachment; filename="invoice.pdf"')
    @LogEvent(EVENT_TYPE.BUYING_PAYMENT_PRINTED)
    async generatePdf(
      @Param('id') id: number,
      @Query() query,
      @Request() req: ExpressRequest,
    ) {
      const downloadedPayment = await this.buyingPaymentService.findOneById(id);
      const performedBy = await this.userService.findOneById(req.user.id);
      req.logInfo = { PaymentId: id , firmId: downloadedPayment.firmId ,performedBy:performedBy.username};
      return this.buyingPaymentService.downloadPdf(id,query.cabinet, query.template);
    }
  
    @UseGuards( PermissionsGuard)
    @Permissions({all:[PERMISSIONS.BUYING_PAYMENT_CREATE]})
  @Post('')
  @LogEvent(EVENT_TYPE.BUYING_PAYMENT_CREATED)
  async save(
    @Body() createPaymentDto: CreateBuyingPaymentDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingPaymentDto> {
    const payment = await this.buyingPaymentService.save(createPaymentDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { PaymentId: payment.id,firmId: payment.firmId ,performedBy:performedBy.username};
    return payment;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.BUYING_PAYMENT_UPDATE]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.BUYING_PAYMENT_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateBuyingPaymentDto: UpdateBuyingPaymentDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingPaymentDto> {
    const { createdAt, updatedAt, deletedAt, ...oldPayment } = await this.buyingPaymentService.findOneById(id);
    const payment = await this.buyingPaymentService.update(id, updateBuyingPaymentDto);
    const { createdAt: Nc, updatedAt: Nu, deletedAt: Nd, ...newPayment } = await this.buyingPaymentService.findOneById(payment.id); ;
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
@Permissions({all:[PERMISSIONS.BUYING_PAYMENT_DELETE]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.BUYING_PAYMENT_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBuyingPaymentDto> {
    const deletedPayment = await this.buyingPaymentService.softDelete(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { PaymentId:id , firmId: deletedPayment.firmId ,performedBy:performedBy.username};
    return deletedPayment;
  }
}
