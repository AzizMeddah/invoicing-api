import {
  Controller,
  Param,
  Get,
  Body,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CabinetService } from '../services/cabinet.service';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { CabinetEntity } from '../repositories/entities/cabinet.entity';
import { CreateCabinetDto } from '../dtos/cabinet.create.dto';
import { ResponseCabinetDto } from '../dtos/cabinet.response.dto';
import { UpdateCabinetDto } from '../dtos/cabinet.update.dto';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';

@ApiTags('cabinet')
@Controller({
  version: '1',
  path: '/cabinet',
})

export class CabinetController {
  constructor(private readonly cabinetService: CabinetService) {}

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.CABINET_READ]})
  @Get('/list')
  async findAll(): Promise<ResponseCabinetDto[]> {
    return await this.cabinetService.findAll();
  }

  @UseGuards( PermissionsGuard)
@Permissions({any:[
  PERMISSIONS.CABINET_READ,
  PERMISSIONS.STATS_READ,
  PERMISSIONS.SELLING_QUOTATION_READ,
  PERMISSIONS.SELLING_INVOICE_READ,
  PERMISSIONS.SELLING_PAYMENT_READ,
  PERMISSIONS.BUYING_QUOTATION_READ,
  PERMISSIONS.BUYING_INVOICE_READ,
  PERMISSIONS.BUYING_PAYMENT_READ,


]})
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(@Param('id') id: number): Promise<ResponseCabinetDto> {
    const cabinet = await this.cabinetService.findOneById(id);
    return {
      ...cabinet,
    };
  }

  /*@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.CABINET_CREATE]})*/
  @Post('')
  async save(
    @Body() createCabinetDto: CreateCabinetDto,
  ): Promise<ResponseCabinetDto> {
    return this.cabinetService.save(createCabinetDto);
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.CABINET_UPDATE]})
  @Put('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async update(
    @Param('id') id: number,
    @Body() updateCabinetDto: UpdateCabinetDto,
  ): Promise<CabinetEntity> {
    return this.cabinetService.update(id, updateCabinetDto);
  }

  /*@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.CABINET_DELETE]})*/
  @Delete('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async delete(@Param('id') id: number): Promise<CabinetEntity> {
    return this.cabinetService.softDelete(id);
  }
}
