import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { CreateUserDto } from '../dtos/user.create.dto';
import { ResponseUserDto } from '../dtos/user.response.dto';
import { UpdateUserDto } from '../dtos/user.update.dto';
import { UserEntity } from '../repositories/entities/user.entity';
import { UserService } from '../services/user.service';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { Request as ExpressRequest } from 'express';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { PermissionsGuard } from 'src/modules/permission/guards/permission.guards';
import { Permissions } from 'src/modules/permission/decorators/permission.decorator';
import { PERMISSIONS } from 'src/app/enums/permissions.enum';
import { plainToInstance } from 'class-transformer';
import { ChangePasswordDto } from '../dtos/user.change-password.dto';

@ApiTags('user')
@Controller({
  version: '1',
  path: '/user',
})
@UseInterceptors(LogInterceptor)

export class UserController {
  constructor(private readonly userService: UserService) {}


  @ApiOperation({ summary: 'Get MyProfile' })
  @ApiResponse({
    status: 200,
    description: 'Return currentuser data.',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get('/profile')
    async getMyProfile(
      @Request() req: ExpressRequest,
      @Query() query: IQueryObject,
    ) {
      const userId = req.user.sub;
      if (query.filter) query.filter += `,id||$eq||${userId}`;
      else query.filter = `id||$eq||${userId}`;
      const user = await  this.userService.findOneByCondition(query);
      return plainToInstance(ResponseUserDto, user, { excludeExtraneousValues: true });
    }

    @Put('/profile')
    @LogEvent(EVENT_TYPE.USER_UPDATED)
    async updateMyProfile(
      @Body() updateUserDto: UpdateUserDto,
      @Request() req: ExpressRequest,
    ): Promise<ResponseUserDto> {
      const userId = req.user.sub;
      const oldUser = await this.userService.findOneByCondition({
        filter : `id||$eq||${userId}`,
        join : 'role'
      })

      const newUser = await this.userService.update(userId, updateUserDto);
      req.logInfo = {
        id:userId,
        username: oldUser.username,
        performedBy: oldUser.username,
      };
      return plainToInstance(ResponseUserDto, newUser, { excludeExtraneousValues: true });
    }

    @Put('/change-password')
    @LogEvent(EVENT_TYPE.USER_UPDATED)
    async changePassword(
      @Body() changePasswordDto: ChangePasswordDto,
      @Request() req: ExpressRequest,
    ): Promise<ResponseUserDto> {
      const userId = req.user.sub;
    
     

      const user = await this.userService.changePassword(userId, changePasswordDto);
      req.logInfo = {
        id:userId,
        username: user.username,
        performedBy: user.username,
      };
      return plainToInstance(ResponseUserDto, user, { excludeExtraneousValues: true });
    }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.USER_READ]})
  @Get('/list')
  @ApiPaginatedResponse(ResponseUserDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseUserDto>> {
    const page = await  this.userService.findAllPaginated(query);
    return new PageDto(
      plainToInstance(ResponseUserDto, page.data, { excludeExtraneousValues: true }),
      page.meta,
    );
  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[PERMISSIONS.USER_READ]})
  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseUserDto[]> {
    const users = await  this.userService.findAll(options);
    return plainToInstance(ResponseUserDto, users, { excludeExtraneousValues: true });

  }

  @UseGuards( PermissionsGuard)
@Permissions({any:[
  PERMISSIONS.USER_READ,
  PERMISSIONS.LOGGS_READ,
]})
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return user by ID.',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseUserDto> {
    if (query.filter) query.filter += `,id||$eq||${id}`;
    else query.filter = `id||$eq||${id}`;
    const user = await  this.userService.findOneByCondition(query);
    return plainToInstance(ResponseUserDto, user, { excludeExtraneousValues: true });
  }

  
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 200,
    description: 'User created successfully.',
    type: UserEntity,
  })
  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.USER_CREATE,
  PERMISSIONS.USER_READ
]})
  @Post()
  @LogEvent(EVENT_TYPE.USER_CREATED)
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseUserDto> {
    const user = await this.userService.save(createUserDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id: user.id ,username:user.username,performedBy:performedBy.username };
    return plainToInstance(ResponseUserDto, user, { excludeExtraneousValues: true });
    ;
  }


  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.USER_UPDATE,
  PERMISSIONS.USER_READ
]})
  @Put(':id')
  @LogEvent(EVENT_TYPE.USER_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseUserDto> {
    const oldUser = await this.userService.findOneByCondition({
      filter : `id||$eq||${id}`,
      join : 'role'
    })
    const user = await this.userService.findOneByCondition({
      filter : `id||$eq||${req.user.sub}`,
      join : 'role'
    })
    if(oldUser.role.isDeletionRestricted &&  !user.role.isDeletionRestricted) throw new ForbiddenException("users.errors.modifie_forbidden");
    const newUser = await this.userService.update(id, updateUserDto);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = {
      id,
      username: oldUser.username,
      performedBy: performedBy.username,
    };

    return plainToInstance(ResponseUserDto, newUser, { excludeExtraneousValues: true });
  }
  
  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.USER_UPDATE,
  PERMISSIONS.USER_READ]})
  @Put('/deactivate/:id')
  @LogEvent(EVENT_TYPE.USER_DEACTIVATED)
  async deactivate(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseUserDto> {
    if (req.user.sub === id) throw new ForbiddenException("users.errors.deactivate_forbidden");
    const deactivatedUser = await this.userService.findOneByCondition({
      filter : `id||$eq||${id}`,
      join : 'role'
    })

    const user = await this.userService.findOneByCondition({
      filter : `id||$eq||${req.user.sub}`,
      join : 'role'
    })
    if(deactivatedUser.role.isDeletionRestricted && !user.role.isDeletionRestricted) throw new ForbiddenException("users.errors.deactivate_forbidden");
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id ,username:deactivatedUser.username,performedBy:performedBy.username};
    const updatedUser = await  this.userService.update(id, { isActive: false });
    return plainToInstance(ResponseUserDto, updatedUser, { excludeExtraneousValues: true });

  }

  @UseGuards( PermissionsGuard)
@Permissions({all:[
  PERMISSIONS.USER_UPDATE,
  PERMISSIONS.USER_READ
]})
  @Put('/activate/:id')
  @LogEvent(EVENT_TYPE.USER_ACTIVATED)
  async activate(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseUserDto> {
    const user = await this.userService.findOneById(id);
    const performedBy = await this.userService.findOneById(req.user.id);
    req.logInfo = { id ,username:user.username,performedBy:performedBy.username};
    const updatedUser= await this.userService.update(id, { isActive: true });
    return plainToInstance(ResponseUserDto, updatedUser, { excludeExtraneousValues: true });

  }


    @ApiParam({
      name: 'id',
      type: 'number',
      required: true,
    })
    @UseGuards( PermissionsGuard)
    @Permissions({all:[
      PERMISSIONS.USER_DELETE,
      PERMISSIONS.USER_READ
    ]})
    @Delete('/:id')
    @LogEvent(EVENT_TYPE.USER_DELETED)
    async delete(
      @Param('id') id: number,
      @Request() req: ExpressRequest,
    ): Promise<ResponseUserDto> {
      if (req.user.sub === id) throw new ForbiddenException("users.errors.delete_forbidden");

      const userToDelete = await this.userService.findOneByCondition({
        filter : `id||$eq||${id}`,
        join : 'role'
      })
      const user = await this.userService.findOneByCondition({
        filter : `id||$eq||${req.user.sub}`,
        join : 'role'
      })
      if(userToDelete.role.isDeletionRestricted && !user.role.isDeletionRestricted  ) throw new ForbiddenException("users.errors.delete_forbidden")
      const deletedUser= await this.userService.softDelete(id);
      const performedBy = await this.userService.findOneById(req.user.id);
      req.logInfo = { 
        id ,
        username:deletedUser.username,
        performedBy:performedBy.username,
      };
      return plainToInstance(ResponseUserDto, deletedUser, { excludeExtraneousValues: true });
    }

}
