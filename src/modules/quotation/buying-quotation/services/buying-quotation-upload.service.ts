import { Injectable } from '@nestjs/common';
import { QuotationUploadNotFoundException } from '../../errors/quotation-upload.notfound';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { StorageService } from 'src/common/storage/services/storage.service';
import { BuyingQuotationUploadRepository } from '../repositories/repository/buying-quotation-upload.repository';
import { BuyingQuotationUploadEntity } from '../repositories/entities/buying-quotation-file.entity';

@Injectable()
export class BuyingQuotationUploadService {
  constructor(
    private readonly quotationUploadRepository: BuyingQuotationUploadRepository,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: number): Promise<BuyingQuotationUploadEntity> {
    const upload = await this.quotationUploadRepository.findOneById(id);
    if (!upload) {
      throw new QuotationUploadNotFoundException();
    }
    return upload;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<BuyingQuotationUploadEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const upload = await this.quotationUploadRepository.findOne(
      queryOptions as FindOneOptions<BuyingQuotationUploadEntity>,
    );
    if (!upload) return null;
    return upload;
  }

  async findAll(query: IQueryObject): Promise<BuyingQuotationUploadEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.quotationUploadRepository.findAll(
      queryOptions as FindManyOptions<BuyingQuotationUploadEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<BuyingQuotationUploadEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.quotationUploadRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.quotationUploadRepository.findAll(
      queryOptions as FindManyOptions<BuyingQuotationUploadEntity>,
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
    quotationId: number,
    uploadId: number,
  ): Promise<BuyingQuotationUploadEntity> {
    return this.quotationUploadRepository.save({ quotationId, uploadId });
  }

  async duplicate(
    id: number,
    quotationId: number,
  ): Promise<BuyingQuotationUploadEntity> {
    //Find the original quotation upload entity
    const originalQuotationUpload = await this.findOneById(id);

    //Use the StorageService to duplicate the file
    const duplicatedUpload = await this.storageService.duplicate(
      originalQuotationUpload.uploadId,
    );

    //Save the duplicated QuotationUploadEntity
    const duplicatedQuotationUpload = await this.quotationUploadRepository.save(
      {
        quotationId: quotationId,
        uploadId: duplicatedUpload.id,
      },
    );

    return duplicatedQuotationUpload;
  }

  async duplicateMany(
    ids: number[],
    quotationId: number,
  ): Promise<BuyingQuotationUploadEntity[]> {
    const duplicatedQuotationUploads = await Promise.all(
      ids.map((id) => this.duplicate(id, quotationId)),
    );
    return duplicatedQuotationUploads;
  }

  async softDelete(id: number): Promise<BuyingQuotationUploadEntity> {
    const upload = await this.findOneById(id);
    this.storageService.delete(upload.uploadId);
    this.quotationUploadRepository.softDelete(upload.id);
    return upload;
  }

  async softDeleteMany(
    quotationUploadEntities: BuyingQuotationUploadEntity[],
  ): Promise<BuyingQuotationUploadEntity[]> {
    this.storageService.deleteMany(
      quotationUploadEntities.map((qu) => qu.upload.id),
    );
    return this.quotationUploadRepository.softDeleteMany(
      quotationUploadEntities.map((qu) => qu.id),
    );
  }

  async deleteAll() {
    return this.quotationUploadRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.quotationUploadRepository.getTotalCount();
  }
}
