import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { FirmInterlocutorEntryService } from '../services/firm-interlocutor-entry.service';
import { ResponseFirmInterlocutorEntryDto } from '../dtos/firm-interlocutor-entry.response.dto';
import { CreateFirmInterlocutorEntryDto } from '../dtos/firm-interlocutor-entry.create.dto';
import { UpdateFirmInterlocutorEntryDto } from '../dtos/firm-interlocutor-entry.update.dto';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { Request as ExpressRequest } from 'express';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('firm-interlocutor-entry')
@Controller({
  version: '1',
  path: '/firm-interlocutor-entry',
})
@UseInterceptors(LogInterceptor)
@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.FIRM_READ,PERMISSIONS.INTERLOCUTOR_READ,]})
export class FirmInterlocutorEntryController {
  constructor(
    private readonly firmInterlocutorEntryService: FirmInterlocutorEntryService,
    private readonly userService: UserService
  ) {}
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
  ): Promise<ResponseFirmInterlocutorEntryDto> {
    return await this.firmInterlocutorEntryService.findOneById(id);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.INTERLOCUTOR_ASSOCUATE,]})
  @Post('')
  @LogEvent(EVENT_TYPE.INTERLOCUTOR_ASSOCIATED)
  async save(
    @Request() req : ExpressRequest,
    @Body()
    createFirmInterlocutorEntryDtos:
      | CreateFirmInterlocutorEntryDto
      | CreateFirmInterlocutorEntryDto[],

  ): Promise<
    ResponseFirmInterlocutorEntryDto | ResponseFirmInterlocutorEntryDto[]
  > {
    if (Array.isArray(createFirmInterlocutorEntryDtos)) {
      return await this.firmInterlocutorEntryService.saveMany(
        createFirmInterlocutorEntryDtos,
      );
    } else {

      const savedEntry = await this.firmInterlocutorEntryService.save(createFirmInterlocutorEntryDtos);
      const entry =  await this.firmInterlocutorEntryService.findOneById(savedEntry.id,['firm','interlocutor'])
      const performedBy = await this.userService.findOneById(req.user.id);

      req.logInfo={
        interlocutorId:entry.interlocutorId,
        interlocutor_name:entry.interlocutor.name,
        interlocutor_surname:entry.interlocutor.surname,
        firmId:entry.firmId,
        firm_name:entry.firm.name,
        performedBy:performedBy.username,
      }
      return savedEntry
    
    }
  }
    @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @UseGuards( PermissionsGuard)
  @Permissions({all:[
    PERMISSIONS.FIRM_UPDATE,
    PERMISSIONS.INTERLOCUTOR_UPDATE,]})
  @Put('/:id')

  async update(
    @Param('id') id: number,
    @Body() updateFirmInterlocutorEntryDto: UpdateFirmInterlocutorEntryDto,
  ): Promise<ResponseFirmInterlocutorEntryDto> {
    return await this.firmInterlocutorEntryService.update(
      id,
      updateFirmInterlocutorEntryDto,
    );
  }

  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.INTERLOCUTOR_UNASSOCIATE]})
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.INTERLOCUTOR_UNASSOCIATED)
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async delete(
    @Param('id') id: number,
    @Request() req : ExpressRequest,
  ): Promise<ResponseFirmInterlocutorEntryDto> {
    const deletedEntry = await this.firmInterlocutorEntryService.softDelete(id);
    const entry =  await this.firmInterlocutorEntryService.findOneById(deletedEntry.id,['firm','interlocutor'])
    
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo={
      interlocutorId:entry.interlocutorId,
      interlocutor_name:entry.interlocutor.name,
      interlocutor_surname:entry.interlocutor.surname,
      firmId:entry.firmId,
      firm_name:entry.firm.name,
      performedBy:performedBy.username,
    }
    return deletedEntry
  }


  @UseGuards( PermissionsGuard)
  @Permissions({all:[PERMISSIONS.INTERLOCUTOR_UNASSOCIATE,]})
  @Delete('/:firmId/:interlocutorId')
  @LogEvent(EVENT_TYPE.INTERLOCUTOR_UNASSOCIATED)
  @ApiParam({
    name: 'firmId',
    type: 'number',
    required: true,
  })
  @ApiParam({
    name: 'interlocutorId',
    type: 'number',
    required: true,
  })
  async deleteByFirmIdAndInterlocutorId(
    @Param('firmId') firmId: number,
    @Param('interlocutorId') interlocutorId: number,
    @Request() req : ExpressRequest,
  ): Promise<ResponseFirmInterlocutorEntryDto> {
    const entry = await this.firmInterlocutorEntryService.findOneByCondition({
      filter: `firmId||$eq||${firmId};interlocutorId||$eq||${interlocutorId}`,
      join:'firm,interlocutor'
    });
    const deletedEntry = await this.firmInterlocutorEntryService.softDeleteByFirmIdAndInterlocutorId(
      firmId,
      interlocutorId,
    );
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo={
      interlocutorId:entry.interlocutorId,
      interlocutor_name:entry.interlocutor.name,
      interlocutor_surname:entry.interlocutor.surname,
      firmId:entry.firmId,
      firm_name:entry.firm.name,
      performedBy:performedBy.username,
    }
    return deletedEntry
  }
}
