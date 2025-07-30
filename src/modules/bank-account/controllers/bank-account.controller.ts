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
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { BankAccountService } from '../services/bank-account.service';
import { ResponseBankAccountDto } from '../dtos/bank-account.response.dto';
import { CreateBankAccountDto } from '../dtos/bank-account.create.dto';
import { UpdateBankAccountDto } from '../dtos/bank-account.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('bank-account')
@Controller({
  version: '1',
  path: '/bank-account',
})
@UseInterceptors(LogInterceptor)

export class BankAccountController {
  constructor(
    private readonly bankAccountService: BankAccountService,
    private readonly userService: UserService

  ) {}

  @UseGuards( PermissionsGuard)
@Permissions({any:[
  PERMISSIONS.BANK_ACCOUNT_READ,
  PERMISSIONS.SELLING_QUOTATION_READ,
  PERMISSIONS.SELLING_INVOICE_READ,

]})
  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseBankAccountDto[]> {
    return await this.bankAccountService.findAll(options);
  }
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.BANK_ACCOUNT_READ]})
  @Get('/list')
  @ApiPaginatedResponse(ResponseBankAccountDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseBankAccountDto>> {
    return await this.bankAccountService.findAllPaginated(query);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.BANK_ACCOUNT_READ]})
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseBankAccountDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return await this.bankAccountService.findOneByCondition(query);
  }
  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.BANK_ACCOUNT_CREATE,PERMISSIONS.BANK_ACCOUNT_READ]})
  @Post('')
  @LogEvent(EVENT_TYPE.BANK_ACCOUNT_CREATED)
  async save(
    @Body() createBankAccountDto: CreateBankAccountDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBankAccountDto> {
    const bank = await this.bankAccountService.save(createBankAccountDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: bank.id ,rib:bank.rib,performedBy:performedBy.username};
    return bank;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.BANK_ACCOUNT_UPDATE,PERMISSIONS.BANK_ACCOUNT_READ]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.BANK_ACCOUNT_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBankAccountDto> {
    const bank = await this.bankAccountService.findOneById(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: bank.id ,rib:bank.rib,performedBy:performedBy.username};
    return await this.bankAccountService.update(id, updateBankAccountDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.BANK_ACCOUNT_DELETE,PERMISSIONS.BANK_ACCOUNT_READ]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.BANK_ACCOUNT_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseBankAccountDto> {
    const bank = await this.bankAccountService.findOneById(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: bank.id ,rib:bank.rib,performedBy:performedBy.username};
    return await this.bankAccountService.softDelete(id);
  }
}
