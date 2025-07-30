import { Injectable } from '@nestjs/common';
import { QuotationMetaDataNotFoundException } from '../../errors/quoation-meta-data.notfound.error';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { BuyingQuotationMetaDataRepository } from '../repositories/repository/buying-quotation-meta-data-repository';
import { BuyingQuotationMetaDataEntity } from '../repositories/entities/buying-quotation-meta-data.entity';
import { ResponseBuyingQuotationMetaDataDto } from '../dtos/buying-quotation-meta-data.response.dto';
import { CreateBuyingQuotationMetaDataDto } from '../dtos/buying-quotation-meta-data.create.dto';
import { UpdateBuyingQuotationMetaDataDto } from '../dtos/buying-quotation-meta-data.update.dto';


@Injectable()
export class BuyingQuotationMetaDataService {
  constructor(
    private readonly quotationMetaDataRepository: BuyingQuotationMetaDataRepository,
  ) {}

  async findOneById(id: number): Promise<BuyingQuotationMetaDataEntity> {
    const data = await this.quotationMetaDataRepository.findOneById(id);
    if (!data) {
      throw new QuotationMetaDataNotFoundException();
    }
    return data;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseBuyingQuotationMetaDataDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const data = await this.quotationMetaDataRepository.findOne(
      queryOptions as FindOneOptions<BuyingQuotationMetaDataEntity>,
    );
    if (!data) return null;
    return data;
  }

  async findAll(query: IQueryObject): Promise<ResponseBuyingQuotationMetaDataDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.quotationMetaDataRepository.findAll(
      queryOptions as FindManyOptions<BuyingQuotationMetaDataEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseBuyingQuotationMetaDataDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.quotationMetaDataRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.quotationMetaDataRepository.findAll(
      queryOptions as FindManyOptions<BuyingQuotationMetaDataEntity>,
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
    createQuotationMetaDataDto: CreateBuyingQuotationMetaDataDto,
  ): Promise<BuyingQuotationMetaDataEntity> {
    return this.quotationMetaDataRepository.save(createQuotationMetaDataDto);
  }

  async update(
    id: number,
    updateQuotationMetaDataDto: UpdateBuyingQuotationMetaDataDto,
  ): Promise<BuyingQuotationMetaDataEntity> {
    const data = await this.findOneById(id);
    return this.quotationMetaDataRepository.save({
      ...data,
      ...updateQuotationMetaDataDto,
    });
  }

  async duplicate(id: number): Promise<BuyingQuotationMetaDataEntity> {
    const existingData = await this.findOneById(id);
    const{createdAt,updatedAt,deletedAt,...filtredData}=existingData
    const duplicatedData = {
      ...filtredData,
      id: undefined,
    };
    return this.quotationMetaDataRepository.save(duplicatedData);
  }

  async softDelete(id: number): Promise<BuyingQuotationMetaDataEntity> {
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
