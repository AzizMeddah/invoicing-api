import { Transactional } from '@nestjs-cls/transactional';
import { BadRequestException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { encryptPasswordWithSalt10 } from 'src/common/auth/utils/encrypt-password';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions, In } from 'typeorm';
import { CreateUserDto } from '../dtos/user.create.dto';
import { UpdateUserDto } from '../dtos/user.update.dto';
import { UserEntity } from '../repositories/entities/user.entity';
import { UserNotFoundException } from '../errors/user.notfound.error';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { UserRepository } from '../repositories/repository/user.repository';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PermissionService } from 'src/modules/permission/services/permission.service';
import { RoleService } from 'src/modules/role/services/role.service';
import { ChangePasswordDto } from '../dtos/user.change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleService: RoleService,
    @Inject(forwardRef(() => PermissionService))
    private readonly permissionService: PermissionService,
  ) { }

  async findOneById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async findOneByCondition(query: IQueryObject): Promise<UserEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const user = await this.userRepository.findOne(
      queryOptions as FindOneOptions<UserEntity>,
    );
    if (!user) return null;
    return user;
  }

  async findAll(query: IQueryObject): Promise<UserEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.userRepository.findAll(
      queryOptions as FindManyOptions<UserEntity>,
    );
  }

  async findAllPaginated(query: IQueryObject): Promise<PageDto<UserEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.userRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.userRepository.findAll(
      queryOptions as FindManyOptions<UserEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: parseInt(query.page),
        take: parseInt(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async getUserPermissions(id: number) {
    const user = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
    });

    const rolePermissions = await this.roleService.findOneByCondition({
      filter: `id||$eq||${user.roleId}`,
      join: 'permissionsEntries'
    })

    if (!rolePermissions || rolePermissions.permissionsEntries.length === 0) {
      return []
    }

    const permissions = await Promise.all(
      rolePermissions.permissionsEntries.map(async (entry) => {
        const permission = await this.permissionService.findOneById(entry.permissionId);
        return permission.label;
      })
    );

    return permissions
  }

  async existingUser(params: { username?: string, email?: string }) {
    const existingUser = (await this.userRepository
      .createQueryBuilder('user'))
      .withDeleted()
    if (params.username) {
      existingUser.andWhere('user.username = :username', { username: params.username })
    }
    if (params.email) {
      existingUser.andWhere('user.email = :email', { email: params.email })
    }
    return existingUser.getMany()
  }

  @Transactional()
  async save(createUserDto: CreateUserDto) {
    const existingUsername = await this.existingUser({ username: createUserDto.username })
    if (existingUsername.length !== 0) {
      throw new BadRequestException('users.errors.username_already_exist')
    }
    const existingEmail = await this.existingUser({ email: createUserDto.email })

    if (existingEmail.length !== 0) {
      throw new BadRequestException('users.errors.email_already_exist')
    }
    return this.userRepository.save({
      ...createUserDto,
      password: await encryptPasswordWithSalt10(createUserDto.password),
    });
  }

  @Transactional()
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const updateData: Partial<UpdateUserDto> = { ...updateUserDto };
    if ("username" in updateUserDto) {
      const existingUsername = await this.existingUser({ username: updateUserDto.username })
      if (existingUsername.length !== 0 && existingUsername.some((user) => user.id !== id)) {
        throw new BadRequestException('users.errors.username_already_exist')
      }
    }
    if ("email" in updateUserDto) {
      const existingEmail = await this.existingUser({ email: updateUserDto.email })
      if (existingEmail.length !== 0 && existingEmail.some((user) => user.id !== id)) {
        throw new BadRequestException('users.errors.email_already_exist')
      }
    }

    if (updateUserDto.password !== undefined) {
      updateData.password = await encryptPasswordWithSalt10(
        updateUserDto.password,
      );
      updateData.refreshToken = null;
    }
    await this.userRepository.update(id, updateData);
    return this.findOneById(id);
  }

  async softDelete(id: number): Promise<UserEntity> {
    await this.findOneById(id);
    return this.userRepository.softDelete(id);
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<UserEntity> {
    const user = await this.findOneById(id);
    if (!(await bcrypt.compare(changePasswordDto.currentPassword, user.password))) {
      throw new BadRequestException('users.errors.wrong_password');
    }
    if ((await bcrypt.compare(changePasswordDto.newPassword, user.password))) {
      throw new BadRequestException('users.errors.same_password');
    }
    const updateData: Partial<UpdateUserDto> = { ...user };
    updateData.password = await encryptPasswordWithSalt10(
      changePasswordDto.newPassword,
    );
    updateData.requirePasswordChange = false
    await this.userRepository.update(id, updateData);
    return this.findOneById(id);


  }

}
