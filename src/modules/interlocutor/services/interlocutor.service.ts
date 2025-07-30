import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InterlocutorRepository } from '../repositories/repository/interlocutor.repository';
import { InterlocutorNotFoundException } from '../errors/interlocutor.notfound.error';
import { InterlocutorEntity } from '../repositories/entity/interlocutor.entity';
import { CreateInterlocutorDto } from '../dtos/interlocutor.create.dto';
import { UpdateInterlocutorDto } from '../dtos/interlocutor.update.dto';
import { ResponseInterlocutorDto } from '../dtos/interlocutor.response.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FirmInterlocutorEntryService } from 'src/modules/firm-interlocutor-entry/services/firm-interlocutor-entry.service';
import { InterlocutorRestrictedDeleteException } from '../errors/interlocutor.restricted-delete.error';
import { BuyingQuotationService } from 'src/modules/quotation/buying-quotation/services/buying-quotation.service';
import { SellingQuotationService } from 'src/modules/quotation/selling-quotation/services/selling-quotation.service';
import { SellingInvoiceService } from 'src/modules/invoice/selling-invoice/services/selling-invoice.service';
import { BuyingInvoiceService } from 'src/modules/invoice/buying-invoice/services/buying-invoice.service';
import { FirmInterlocutorEntryEntity } from 'src/modules/firm-interlocutor-entry/repositories/entities/firm-interlocutor-entry.entity';
import { InterlocutorAlreadyExistsException } from '../errors/interlocutor.alreadyexists.error';

@Injectable()
export class InterlocutorService {
  constructor(
    private readonly interlocutorRepository: InterlocutorRepository,
    @Inject(forwardRef(() => FirmInterlocutorEntryService))

    private readonly firmInterlocutorService: FirmInterlocutorEntryService,
    private readonly buyingQuotationService: BuyingQuotationService,
    private readonly buyingInvoiceService: BuyingInvoiceService,
    private readonly sellingQuotationService: SellingQuotationService,
    private readonly sellingInvoiceService: SellingInvoiceService,
  ) { }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<InterlocutorEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const interlocutor = await this.interlocutorRepository.findOne(
      queryOptions as FindOneOptions<InterlocutorEntity>,
    );
    if (!interlocutor) return null;
    return interlocutor;
  }

  async findAll(query: IQueryObject): Promise<ResponseInterlocutorDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.interlocutorRepository.findAll(
      queryOptions as FindManyOptions<InterlocutorEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseInterlocutorDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.interlocutorRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.interlocutorRepository.findAll(
      queryOptions as FindManyOptions<InterlocutorEntity>,
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

  async findOneById(id: number): Promise<InterlocutorEntity> {
    const interlocutor = await this.interlocutorRepository.findOneById(id);
    if (!interlocutor) {
      throw new InterlocutorNotFoundException();
    }
    return interlocutor;
  }

  async save(
    createInterlocutorDto: CreateInterlocutorDto,
  ): Promise<InterlocutorEntity> {
    const existingEmail = await this.findOneByCondition(
      { 
        filter: `email||$eq||${createInterlocutorDto.email};deletedAt||$isnull` 
      })
    if(existingEmail){
      throw new InterlocutorAlreadyExistsException()
    }

    const interlocutor = await this.interlocutorRepository.save(
      createInterlocutorDto,
    );
    if (createInterlocutorDto.firmsToInterlocutor)
      this.firmInterlocutorService.saveMany(
        createInterlocutorDto.firmsToInterlocutor.map((entry) => {
          return {
            ...entry,
            interlocutorId: interlocutor.id,
          };
        }),
      );
    return interlocutor;
  }

  async promote(id: number, firmId: number): Promise<InterlocutorEntity> {
    const interlocutor = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
    });
    const firmInterlocutor =
      await this.firmInterlocutorService.findOneByCondition({
        filter: `interlocutorId||$eq||${id};firmId||$eq||${firmId}`,
      });
    await this.firmInterlocutorService.save({
      ...firmInterlocutor,
      isMain: true,
    });
    return interlocutor;
  }

  async demote(firmId: number): Promise<InterlocutorEntity> {
    const firmInterlocutor =
      await this.firmInterlocutorService.findOneByCondition({
        filter: `isMain||$eq||1;firmId||$eq||${firmId}`,
      });
    const demoted = await this.findOneByCondition({
      filter: `id||$eq||${firmInterlocutor.interlocutorId}`,
    });
    await this.firmInterlocutorService.save({
      ...firmInterlocutor,
      isMain: false,
    });
    return demoted;
  }

  async update(
    id: number,
    updateInterlocutorDto: UpdateInterlocutorDto,
  ): Promise<InterlocutorEntity> {
    const existingInterlocutor = await this.findOneById(id);
const existingEmail = await this.findOneByCondition(
      { 
        filter: `email||$eq||${updateInterlocutorDto.email};deletedAt||$isnull;id||!$eq||${id}` 
      })
    if(existingEmail){
      throw new InterlocutorAlreadyExistsException()
    }
    await this.interlocutorRepository.update(id, {
      ...existingInterlocutor,
      ...updateInterlocutorDto,
    });

    return this.findOneById(id);
  }
  async handleRelatedEntities(id: number, firmId?: number) {
    const services = [
      {
        service: this.buyingQuotationService,
        name: 'BuyingQuotation',
      },
      {
        service: this.buyingInvoiceService,
        name: 'BuyingInvoice',
      },
      {
        service: this.sellingQuotationService,
        name: 'SellingQuotation',
      },
      {
        service: this.sellingInvoiceService,
        name: 'SellingInvoice',
      },
    ];

    for (const { service, name } of services) {
      const filter = [`interlocutorId||$eq||${id}`];
      if (firmId) {
        filter.push(`firmId||$eq||${firmId}`);
      }

      const relatedEntries = await service.findAll({ filter: filter.join(',') });

      for (const entry of relatedEntries) {
        const firmMain = await this.firmInterlocutorService.findOneByCondition({
          filter: `firmId||$eq||${entry.firmId},isMain||$eq||true`,
        });

        if (firmMain) {
          await service.patch(entry.id, {
            interlocutorId: firmMain.interlocutorId,
          });
        }
      }
    }
  }


  async softDelete(id: number): Promise<InterlocutorEntity> {
    const interlocutor = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'firmsToInterlocutor'
    });
    const isMain = interlocutor.firmsToInterlocutor.some((entry) => entry.isMain)
    if (isMain) {
      throw new InterlocutorRestrictedDeleteException()
    }
    const firmInterlocutors = await this.firmInterlocutorService.findAllByInterlocutorId(id)
    await this.firmInterlocutorService.softDeleteMany(firmInterlocutors.map((entry) => entry.id))
    await this.handleRelatedEntities(id)

    return this.interlocutorRepository.softDelete(id);
  }
}
