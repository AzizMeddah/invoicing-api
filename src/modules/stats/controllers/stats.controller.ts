import { Body, Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { StatsService } from '../services/stats.service';
import { GetStatsDto } from '../dto/stats-get.dto';
import { ResponseGlobalStatsDto } from '../dto/global-stats.response.dto';
import { ResponseSellingStatsDto } from '../dto/selling-stats.response.dto';
import { ResponseBuyingStatsDto } from '../dto/buying-stats.response.dto';
import { ResponseClientStatsDto } from '../dto/client-stats.response.dto';
import { ResponseSupplierStatsDto } from '../dto/supplier-stats.response.dto';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { ResponseUserStatsDto } from '../dto/user-stats.response.dto';


@ApiTags('stats')
@Controller({
  version: '1',
  path: '/stats',
})
@UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.STATS_READ]})
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
  ) {}

  // Tableau de bord global
  @Get('/global')
  async getGlobalDashboard(@Query() getStatsDto: GetStatsDto): Promise<ResponseGlobalStatsDto> {
    let globalStats= await this.statsService.getGlobalDashboard(getStatsDto)
      return globalStats;
  }

  // Tableau de bord de vente
  @Get('/selling')
  async getSellingDashboard(@Query() getStatsDto: GetStatsDto): Promise<ResponseSellingStatsDto>{
    let globalStats= await this.statsService.getSellingDashboard(getStatsDto)
      return globalStats;
  }

  // Tableau de bord d achat
  @Get('/buying')
  async getBuyingDashboard(@Query() getStatsDto: GetStatsDto): Promise<ResponseBuyingStatsDto>{
    let globalStats= await this.statsService.getBuyingDashboard(getStatsDto)
      return globalStats;
  }

  // Tableau de bord d firm as client
  @Get('/client')
  async getClientDashboard(@Query() getStatsDto: GetStatsDto): Promise<ResponseClientStatsDto>{
    let globalStats= await this.statsService.getClientDashboard(getStatsDto)
      return globalStats;
  }
  

  // Tableau de bord d firm as supplier
  @Get('/supplier')
  async getSupplierDashboard(@Query() getStatsDto: GetStatsDto): Promise<ResponseSupplierStatsDto>{
    let globalStats= await this.statsService.getSupplierDashboard(getStatsDto)
      return globalStats;
  }

    // Tableau d urilisateur
    @Get('/user')
    async getUserStats(@Query() params:{userId:number}):Promise<ResponseUserStatsDto>{
      let userStats= await this.statsService.getUserStats(params.userId)
        return userStats;
    }
  
}