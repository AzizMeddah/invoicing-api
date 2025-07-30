import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { StorageService } from 'src/common/storage/services/storage.service';
import { PaymentUploadNotFoundException } from '../../errors/payment-upload.notfound.error';
import { SellingPaymentUploadRepository } from '../repositories/repository/selling-payment-file.repository';
import { SellingPaymentUploadEntity } from '../repositories/entities/selling-payment-file.entity';
;

@Injectable()
export class SellingPaymentUploadService {
  constructor(
    private readonly paymentUploadRepository: SellingPaymentUploadRepository,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: number): Promise<SellingPaymentUploadEntity> {
    const upload = await this.paymentUploadRepository.findOneById(id);
    if (!upload) {
      throw new PaymentUploadNotFoundException();
    }
    return upload;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<SellingPaymentUploadEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const upload = await this.paymentUploadRepository.findOne(
      queryOptions as FindOneOptions<SellingPaymentUploadEntity>,
    );
    if (!upload) return null;
    return upload;
  }

  async findAll(query: IQueryObject): Promise<SellingPaymentUploadEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.paymentUploadRepository.findAll(
      queryOptions as FindManyOptions<SellingPaymentUploadEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<SellingPaymentUploadEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.paymentUploadRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.paymentUploadRepository.findAll(
      queryOptions as FindManyOptions<SellingPaymentUploadEntity>,
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
    paymentId: number,
    uploadId: number,
  ): Promise<SellingPaymentUploadEntity> {
    return this.paymentUploadRepository.save({ paymentId, uploadId });
  }

  async duplicate(id: number, paymentId: number): Promise<SellingPaymentUploadEntity> {
    //Find the original payment upload entity
    const originalPaymentUpload = await this.findOneById(id);

    //Use the StorageService to duplicate the file
    const duplicatedUpload = await this.storageService.duplicate(
      originalPaymentUpload.uploadId,
    );

    //Save the duplicated PaymentUploadEntity
    const duplicatedPaymentUpload = await this.paymentUploadRepository.save({
      paymentId,
      uploadId: duplicatedUpload.id,
    });

    return duplicatedPaymentUpload;
  }

  async duplicateMany(
    ids: number[],
    paymentId: number,
  ): Promise<SellingPaymentUploadEntity[]> {
    const duplicatedPaymentUploads = await Promise.all(
      ids.map((id) => this.duplicate(id, paymentId)),
    );
    return duplicatedPaymentUploads;
  }

  async softDelete(id: number): Promise<SellingPaymentUploadEntity> {
    const upload = await this.findOneById(id);
    this.storageService.delete(upload.uploadId);
    this.paymentUploadRepository.softDelete(upload.id);
    return upload;
  }

  async softDeleteMany(
    quotationUploadEntities: SellingPaymentUploadEntity[],
  ): Promise<SellingPaymentUploadEntity[]> {
    this.storageService.deleteMany(
      quotationUploadEntities.map((qu) => qu.upload.id),
    );
    return this.paymentUploadRepository.softDeleteMany(
      quotationUploadEntities.map((qu) => qu.id),
    );
  }

  async deleteAll() {
    return this.paymentUploadRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.paymentUploadRepository.getTotalCount();
  }
}
