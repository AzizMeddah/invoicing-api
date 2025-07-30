import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { InvoiceMetaDataNotFoundException } from '../../errors/invoice-meta-data.notfound.error';
import { BuyingInvoiceMetaDataRepository } from '../repositories/repository/buying-invoice-meta-data.repository';
import { BuyingInvoiceMetaDataEntity } from '../repositories/entities/buying-invoice-meta-data.entity';
import { ResponseBuyingInvoiceMetaDataDto } from '../dtos/buying-invoice-meta-data.response.dto';
import { CreateBuyingInvoiceMetaDataDto } from '../dtos/buying-invoice-meta-data.create.dto';
import { UpdateBuyingInvoiceMetaDataDto } from '../dtos/buying-invoice-meta-data.update.dto';


@Injectable()
export class BuyingInvoiceMetaDataService {
  constructor(
    private readonly invoiceMetaDataRepository: BuyingInvoiceMetaDataRepository,
  ) {}

  async findOneById(id: number): Promise<BuyingInvoiceMetaDataEntity> {
    const data = await this.invoiceMetaDataRepository.findOneById(id);
    if (!data) {
      throw new InvoiceMetaDataNotFoundException();
    }
    return data;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseBuyingInvoiceMetaDataDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const data = await this.invoiceMetaDataRepository.findOne(
      queryOptions as FindOneOptions<BuyingInvoiceMetaDataEntity>,
    );
    if (!data) return null;
    return data;
  }

  async findAll(query: IQueryObject): Promise<ResponseBuyingInvoiceMetaDataDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.invoiceMetaDataRepository.findAll(
      queryOptions as FindManyOptions<BuyingInvoiceMetaDataEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseBuyingInvoiceMetaDataDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.invoiceMetaDataRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.invoiceMetaDataRepository.findAll(
      queryOptions as FindManyOptions<BuyingInvoiceMetaDataEntity>,
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
    createInvoiceMetaDataDto: CreateBuyingInvoiceMetaDataDto,
  ): Promise<BuyingInvoiceMetaDataEntity> {
    return this.invoiceMetaDataRepository.save(createInvoiceMetaDataDto);
  }

  async update(
    id: number,
    updateInvoiceMetaDataDto: UpdateBuyingInvoiceMetaDataDto,
  ): Promise<BuyingInvoiceMetaDataEntity> {
    const data = await this.findOneById(id);
    return this.invoiceMetaDataRepository.save({
      ...data,
      ...updateInvoiceMetaDataDto,
    });
  }

  async duplicate(id: number): Promise<BuyingInvoiceMetaDataEntity> {
    const existingData = await this.findOneById(id);
    const{createdAt,updatedAt,deletedAt,...filtredData}=existingData
    const duplicatedData = {
      ...filtredData,
      id: undefined,
    };
    return this.invoiceMetaDataRepository.save(duplicatedData);
  }

  async softDelete(id: number): Promise<BuyingInvoiceMetaDataEntity> {
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
