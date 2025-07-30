import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';

import { InvoiceMetaDataNotFoundException } from '../../errors/invoice-meta-data.notfound.error';
import { SellingInvoiceMetaDataRepository } from '../repositories/repository/selling-invoice-meta-data.repository';
import { SellingInvoiceMetaDataEntity } from '../repositories/entities/selling-invoice-meta-data.entity';
import { ResponseSellingInvoiceMetaDataDto } from '../dtos/selling-invoice-meta-data.response.dto';
import { CreateSellingInvoiceMetaDataDto } from '../dtos/selling-invoice-meta-data.create.dto';
import { UpdateSellingInvoiceMetaDataDto } from '../dtos/selling-invoice-meta-data.update.dto';


@Injectable()
export class SellingInvoiceMetaDataService {
  constructor(
    private readonly invoiceMetaDataRepository: SellingInvoiceMetaDataRepository,
  ) {}

  async findOneById(id: number): Promise<SellingInvoiceMetaDataEntity> {
    const data = await this.invoiceMetaDataRepository.findOneById(id);
    if (!data) {
      throw new InvoiceMetaDataNotFoundException();
    }
    return data;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseSellingInvoiceMetaDataDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const data = await this.invoiceMetaDataRepository.findOne(
      queryOptions as FindOneOptions<SellingInvoiceMetaDataEntity>,
    );
    if (!data) return null;
    return data;
  }

  async findAll(query: IQueryObject): Promise<ResponseSellingInvoiceMetaDataDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.invoiceMetaDataRepository.findAll(
      queryOptions as FindManyOptions<SellingInvoiceMetaDataEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseSellingInvoiceMetaDataDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.invoiceMetaDataRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.invoiceMetaDataRepository.findAll(
      queryOptions as FindManyOptions<SellingInvoiceMetaDataEntity>,
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

  async save(
    createInvoiceMetaDataDto: CreateSellingInvoiceMetaDataDto,
  ): Promise<SellingInvoiceMetaDataEntity> {
    return this.invoiceMetaDataRepository.save(createInvoiceMetaDataDto);
  }

  async update(
    id: number,
    updateInvoiceMetaDataDto: UpdateSellingInvoiceMetaDataDto,
  ): Promise<SellingInvoiceMetaDataEntity> {
    const data = await this.findOneById(id);
    return this.invoiceMetaDataRepository.save({
      ...data,
      ...updateInvoiceMetaDataDto,
    });
  }

  async duplicate(id: number): Promise<SellingInvoiceMetaDataEntity> {
    const existingData = await this.findOneById(id);
    const{createdAt,updatedAt,deletedAt,...filtredData}=existingData
    const duplicatedData = {
      ...filtredData,
      id: undefined,
    };
    return this.invoiceMetaDataRepository.save(duplicatedData);
  }

  async softDelete(id: number): Promise<SellingInvoiceMetaDataEntity> {
    await this.findOneById(id);
    return this.invoiceMetaDataRepository.softDelete(id);
  }

  async deleteAll() {
    return this.invoiceMetaDataRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.invoiceMetaDataRepository.getTotalCount();
  }
}
