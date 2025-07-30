import { Injectable } from '@nestjs/common';
import { QuotationMetaDataNotFoundException } from '../../errors/quoation-meta-data.notfound.error';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { SellingQuotationMetaDataRepository } from '../repositories/repository/selling-quotation-meta-data-repository';
import { SellingQuotationMetaDataEntity } from '../repositories/entities/selling-quotation-meta-data.entity';
import { ResponseSellingQuotationMetaDataDto } from '../dtos/selling-quotation-meta-data.response.dto';
import { CreateSellingQuotationMetaDataDto } from '../dtos/selling-quotation-meta-data.create.dto';
import { UpdateSellingQuotationMetaDataDto } from '../dtos/selling-quotation-meta-data.update.dto';

@Injectable()
export class SellingQuotationMetaDataService {
  constructor(
    private readonly quotationMetaDataRepository: SellingQuotationMetaDataRepository,
  ) {}

  async findOneById(id: number): Promise<SellingQuotationMetaDataEntity> {
    const data = await this.quotationMetaDataRepository.findOneById(id);
    if (!data) {
      throw new QuotationMetaDataNotFoundException();
    }
    return data;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseSellingQuotationMetaDataDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const data = await this.quotationMetaDataRepository.findOne(
      queryOptions as FindOneOptions<SellingQuotationMetaDataEntity>,
    );
    if (!data) return null;
    return data;
  }

  async findAll(query: IQueryObject): Promise<ResponseSellingQuotationMetaDataDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.quotationMetaDataRepository.findAll(
      queryOptions as FindManyOptions<SellingQuotationMetaDataEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseSellingQuotationMetaDataDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.quotationMetaDataRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.quotationMetaDataRepository.findAll(
      queryOptions as FindManyOptions<SellingQuotationMetaDataEntity>,
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
    createQuotationMetaDataDto: CreateSellingQuotationMetaDataDto,
  ): Promise<SellingQuotationMetaDataEntity> {
    return this.quotationMetaDataRepository.save(createQuotationMetaDataDto);
  }

  async update(
    id: number,
    updateQuotationMetaDataDto: UpdateSellingQuotationMetaDataDto,
  ): Promise<SellingQuotationMetaDataEntity> {
    const data = await this.findOneById(id);
    return this.quotationMetaDataRepository.save({
      ...data,
      ...updateQuotationMetaDataDto,
    });
  }

  async duplicate(id: number): Promise<SellingQuotationMetaDataEntity> {
    const existingData = await this.findOneById(id);
    const{createdAt,updatedAt,deletedAt,...filtredData}=existingData
    const duplicatedData = {
      ...filtredData,
      id: undefined,
    };
    return this.quotationMetaDataRepository.save(duplicatedData);
  }

  async softDelete(id: number): Promise<SellingQuotationMetaDataEntity> {
    await this.findOneById(id);
    return this.quotationMetaDataRepository.softDelete(id);
  }

  async deleteAll() {
    return this.quotationMetaDataRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.quotationMetaDataRepository.getTotalCount();
  }
}
