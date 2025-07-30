import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { StorageService } from 'src/common/storage/services/storage.service';
import { InvoiceUploadNotFoundException } from '../../errors/invoice-upload.notfound';
import { SellingInvoiceUploadRepository } from '../repositories/repository/selling-invoice-upload.repository';
import { SellingInvoiceUploadEntity } from '../repositories/entities/selling-invoice-file.entity';

@Injectable()
export class SellingInvoiceUploadService {
  constructor(
    private readonly invoiceUploadRepository: SellingInvoiceUploadRepository,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: number): Promise<SellingInvoiceUploadEntity> {
    const upload = await this.invoiceUploadRepository.findOneById(id);
    if (!upload) {
      throw new InvoiceUploadNotFoundException();
    }
    return upload;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<SellingInvoiceUploadEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const upload = await this.invoiceUploadRepository.findOne(
      queryOptions as FindOneOptions<SellingInvoiceUploadEntity>,
    );
    if (!upload) return null;
    return upload;
  }

  async findAll(query: IQueryObject): Promise<SellingInvoiceUploadEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.invoiceUploadRepository.findAll(
      queryOptions as FindManyOptions<SellingInvoiceUploadEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<SellingInvoiceUploadEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.invoiceUploadRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.invoiceUploadRepository.findAll(
      queryOptions as FindManyOptions<SellingInvoiceUploadEntity>,
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
    invoiceId: number,
    uploadId: number,
  ): Promise<SellingInvoiceUploadEntity> {
    return this.invoiceUploadRepository.save({ invoiceId, uploadId });
  }

  async duplicate(id: number, invoiceId: number): Promise<SellingInvoiceUploadEntity> {
    //Find the original invoice upload entity
    const originalInvoiceUpload = await this.findOneById(id);

    //Use the StorageService to duplicate the file
    const duplicatedUpload = await this.storageService.duplicate(
      originalInvoiceUpload.uploadId,
    );

    //Save the duplicated InvoiceUploadEntity
    const duplicatedInvoiceUpload = await this.invoiceUploadRepository.save({
      invoiceId: invoiceId,
      uploadId: duplicatedUpload.id,
    });

    return duplicatedInvoiceUpload;
  }

  async duplicateMany(
    ids: number[],
    invoiceId: number,
  ): Promise<SellingInvoiceUploadEntity[]> {
    const duplicatedInvoiceUploads = await Promise.all(
      ids.map((id) => this.duplicate(id, invoiceId)),
    );
    return duplicatedInvoiceUploads;
  }

  async softDelete(id: number): Promise<SellingInvoiceUploadEntity> {
    const upload = await this.findOneById(id);
    this.storageService.delete(upload.uploadId);
    this.invoiceUploadRepository.softDelete(upload.id);
    return upload;
  }

  async softDeleteMany(
    invoiceUploadEntities: SellingInvoiceUploadEntity[],
  ): Promise<SellingInvoiceUploadEntity[]> {
    this.storageService.deleteMany(
      invoiceUploadEntities.map((qu) => qu.upload.id),
    );
    return this.invoiceUploadRepository.softDeleteMany(
      invoiceUploadEntities.map((qu) => qu.id),
    );
  }

  async deleteAll() {
    return this.invoiceUploadRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.invoiceUploadRepository.getTotalCount();
  }
}
