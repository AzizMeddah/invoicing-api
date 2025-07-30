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

import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';
import { FirmBankAccountService } from '../services/firm-bank-account.service';
import { ResponseFirmBankAccountDto } from '../dtos/firm-bank-account.response.dto';
import { CreateFirmBankAccountDto } from '../dtos/firm-bank-account.create.dto';
import { UpdateFirmBankAccountDto } from '../dtos/firm-bank-account.update.dto';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('bank-account')
@Controller({
  version: '1',
  path: '/firm-bank-account',
})
@UseInterceptors(LogInterceptor)

export class FirmBankAccountController {
  constructor(
    private readonly bankAccountService: FirmBankAccountService,
    private readonly userService: UserService
  ) {}

  @UseGuards( PermissionsGuard)
@Permissions({any:[
  PERMISSIONS.BUYING_QUOTATION_READ,
  PERMISSIONS.BUYING_INVOICE_READ,
  PERMISSIONS.FIRM_BANK_ACCOUNT_READ]})
  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseFirmBankAccountDto[]> {
    return await this.bankAccountService.findAll(options);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.FIRM_READ,
  PERMISSIONS.FIRM_BANK_ACCOUNT_READ]})
  @Get('/list')
  @ApiPaginatedResponse(ResponseFirmBankAccountDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseFirmBankAccountDto>> {
    return await this.bankAccountService.findAllPaginated(query);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.FIRM_READ,
  PERMISSIONS.FIRM_BANK_ACCOUNT_READ]})
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseFirmBankAccountDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return await this.bankAccountService.findOneByCondition(query);
  }

  @UseGuards( PermissionsGuard)
  @Permissions({all:[
    PERMISSIONS.FIRM_BANK_ACCOUNT_CREATE,
    PERMISSIONS.FIRM_READ,
    PERMISSIONS.FIRM_BANK_ACCOUNT_READ]})
  @Post('')
  @LogEvent(EVENT_TYPE.FIRM_BANK_ACCOUNT_CREATED)
  async save(
    @Body() createBankAccountDto: CreateFirmBankAccountDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseFirmBankAccountDto> {

    const bank = await this.bankAccountService.save(createBankAccountDto);
    const query = {
      filter : `id||$eq||${bank.id}`,
      join :'Firm'
    }
    const lBank = await this.bankAccountService.findOneById(bank.id,['firm']);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: bank.id ,rib:bank.rib,firm_name:lBank.firm.name,performedBy:performedBy.username};
    return bank;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })

  @UseGuards( PermissionsGuard)
  @Permissions({all:[
    
  PERMISSIONS.FIRM_READ,
  PERMISSIONS.FIRM_BANK_ACCOUNT_READ,
    PERMISSIONS.FIRM_BANK_ACCOUNT_UPDATE]})
  @Put('/:id')
  @LogEvent(EVENT_TYPE.FIRM_BANK_ACCOUNT_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateBankAccountDto: UpdateFirmBankAccountDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseFirmBankAccountDto> {
    const lBank = await this.bankAccountService.findOneById(id,['firm']);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: id ,rib:lBank.rib,firm_name:lBank.firm.name,performedBy:performedBy.username};
    return await this.bankAccountService.update(id, updateBankAccountDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })

  @UseGuards( PermissionsGuard)
  @Permissions({all:[
    
  PERMISSIONS.FIRM_READ,
  PERMISSIONS.FIRM_BANK_ACCOUNT_READ,
  PERMISSIONS.FIRM_BANK_ACCOUNT_DELETE]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.FIRM_BANK_ACCOUNT_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseFirmBankAccountDto> {
    const lBank = await this.bankAccountService.findOneById(id,['firm']);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: id ,rib:lBank.rib,firm_name:lBank.firm.name,performedBy:performedBy.username};
    return await this.bankAccountService.softDelete(id);
  }
}
