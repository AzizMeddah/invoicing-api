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
import { PaymentConditionService } from '../services/payment-condition.service';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ResponsePaymentConditionDto } from '../dtos/payment-condition.response.dto';
import { CreatePaymentConditionDto } from '../dtos/payment-condition.create.dto';
import { UpdatePaymentConditionDto } from '../dtos/payment-condition.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { Request as ExpressRequest } from 'express';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';



@ApiTags('payment-condition')
@Controller({
  version: '1',
  path: '/payment-condition',
})
@UseInterceptors(LogInterceptor)

export class PaymentConditionController {
  constructor(
    private readonly paymentConditionService: PaymentConditionService,
    private readonly userService: UserService
  ) {}

  @UseGuards( PermissionsGuard)
  @Permissions({any:[
    PERMISSIONS.PAYMENT_CONDITION_READ,
    PERMISSIONS.FIRM_READ]})
  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponsePaymentConditionDto[]> {
    return this.paymentConditionService.findAll(options);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.PAYMENT_CONDITION_READ]})
  @Get('/list')
  @ApiPaginatedResponse(ResponsePaymentConditionDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponsePaymentConditionDto>> {
    return this.paymentConditionService.findAllPaginated(query);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.PAYMENT_CONDITION_READ]})
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponsePaymentConditionDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.paymentConditionService.findOneByCondition(query);
  }

  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.PAYMENT_CONDITION_CREATE,PERMISSIONS.PAYMENT_CONDITION_READ]})
  @Post('')
  @LogEvent(EVENT_TYPE.PAYMENT_CONDITION_CREATED)
  async save(
    @Body() createPaymentConditionDto: CreatePaymentConditionDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponsePaymentConditionDto> {
    const condition = await this.paymentConditionService.save(
      createPaymentConditionDto,
    );
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: condition.id , label:condition.label,performedBy:performedBy.username };
    return condition;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.PAYMENT_CONDITION_UPDATE,PERMISSIONS.PAYMENT_CONDITION_READ]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.PAYMENT_CONDITION_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updatePaymentConditionDto: UpdatePaymentConditionDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponsePaymentConditionDto> {

    const condition = await this.paymentConditionService.findOneById(id)
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: condition.id , label:condition.label ,performedBy:performedBy.username };
    return this.paymentConditionService.update(id, updatePaymentConditionDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.PAYMENT_CONDITION_DELETE,PERMISSIONS.PAYMENT_CONDITION_READ]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.PAYMENT_CONDITION_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponsePaymentConditionDto> {
    const condition = await this.paymentConditionService.softDelete(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: condition.id , label:condition.label ,performedBy:performedBy.username };
    return condition;
  }
}
