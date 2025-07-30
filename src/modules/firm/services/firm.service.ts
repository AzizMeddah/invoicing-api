import { BadRequestException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { FirmRepository } from '../repositories/repository/firm.repository';
import { FirmEntity } from '../repositories/entities/firm.entity';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { CreateFirmDto } from '../dtos/firm.create.dto';
import { FirmNotFoundException } from '../errors/firm.notfound.error';
import { UpdateFirmDto } from '../dtos/firm.update.dto';
import { ResponseFirmDto } from '../dtos/firm.response.dto';
import { InterlocutorService } from 'src/modules/interlocutor/services/interlocutor.service';
import {
  FirmAlreadyExistsException,
  TaxIdNumberDuplicateException,
} from '../errors/firm.alreadyexists.error';
import { AddressService } from 'src/modules/address/services/address.service';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { ActivityService } from 'src/modules/activity/services/activity.service';
import { PaymentConditionService } from 'src/modules/payment-condition/services/payment-condition.service';
import { FirmInterlocutorEntryService } from 'src/modules/firm-interlocutor-entry/services/firm-interlocutor-entry.service';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { SellingInvoiceService } from 'src/modules/invoice/selling-invoice/services/selling-invoice.service';
import { BuyingInvoiceService } from 'src/modules/invoice/buying-invoice/services/buying-invoice.service';
import { BuyingInvoiceRepository } from 'src/modules/invoice/buying-invoice/repositories/repository/buying-invoice.repository';
import { SellingInvoiceRepository } from 'src/modules/invoice/selling-invoice/repositories/repository/selling-invoice.repository';
import { TopFirmDto } from '../dtos/top-firm.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SellingPaymentRepository } from 'src/modules/payment/selling-payment/repositories/repository/selling-payment.repository';
import { BuyingPaymentRepository } from 'src/modules/payment/buying-payment/repositories/repository/buying-payment.repository';
import { BuyingPaymentService } from 'src/modules/payment/buying-payment/services/buying-payment.service';
import { SellingPaymentService } from 'src/modules/payment/selling-payment/services/selling-payment.service';
import { SellingQuotationService } from 'src/modules/quotation/selling-quotation/services/selling-quotation.service';
import { BuyingQuotationService } from 'src/modules/quotation/buying-quotation/services/buying-quotation.service';
import { FirmBankAccountService } from 'src/modules/firm-bank-account/services/firm-bank-account.service';
import { UserService } from 'src/modules/user/services/user.service';
import * as bcrypt from 'bcrypt';


@Injectable()
export class FirmService {
  constructor(
    private readonly firmRepository: FirmRepository,
    private readonly activityService: ActivityService,
    private readonly currencyService: CurrencyService,
    private readonly addressService: AddressService,
    private readonly paymentConditionService: PaymentConditionService,
 @Inject(forwardRef(() => InterlocutorService))
           private readonly interlocutorService: InterlocutorService,
           @Inject(forwardRef(() => FirmInterlocutorEntryService))

    private readonly firmInterlocutorEntryService: FirmInterlocutorEntryService,
    private readonly buyingPaymentRepository: BuyingPaymentRepository,
    private readonly sellingPaymentRepository: SellingPaymentRepository,
    @Inject(forwardRef(() => BuyingQuotationService))

    private readonly buyingQuotationService :BuyingQuotationService,
    private readonly buyingInvoiceService :BuyingInvoiceService,
    private readonly buyingPaymentService :BuyingPaymentService,

    private readonly sellingQuotationService :SellingQuotationService,
    private readonly sellingInvoiceService :SellingInvoiceService,
    private readonly sellingPaymentService: SellingPaymentService,

    private readonly firmBankAccountService :FirmBankAccountService,

    private readonly userService:UserService
  ) {}

  async findOneById(id: number,relations?:string[]): Promise<FirmEntity> {
    const firm = await this.firmRepository.findByCondition({
      where: { id },
      relations:relations
    });
    if (!firm) {
      throw new FirmNotFoundException();
    }
    return firm;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseFirmDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const firm = await this.firmRepository.findOne(
      queryOptions as FindOneOptions<FirmEntity>,
    );
    if (!firm) return null;
    return firm;
  }

  async findAll(query: IQueryObject): Promise<ResponseFirmDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.firmRepository.findAll(
      queryOptions as FindManyOptions<FirmEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseFirmDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.firmRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.firmRepository.findAll(
      queryOptions as FindManyOptions<FirmEntity>,
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

  async save(createFirmDto: CreateFirmDto): Promise<FirmEntity> {
    let firm = await this.firmRepository.findByCondition({
      where: { name: createFirmDto.name },
    });
    if (firm) {
      throw new FirmAlreadyExistsException();
    }

    if (!createFirmDto.isPerson) {
      firm = await this.firmRepository.findByCondition({
        where: { taxIdNumber: createFirmDto.taxIdNumber },
      });

      if (firm) {
        throw new TaxIdNumberDuplicateException();
      }
    } else {
      delete createFirmDto.taxIdNumber;
    }

    const invoicingAddress = await this.addressService.save(
      createFirmDto.invoicingAddress,
    );
    const deliveryAddress = await this.addressService.save(
      createFirmDto.deliveryAddress,
    );
    const savedFirm = await this.firmRepository.save({
      ...createFirmDto,
      invoicingAddressId: invoicingAddress.id,
      deliveryAddressId: deliveryAddress.id,
    });

    const mainInterlocutor = await this.interlocutorService.save(
      createFirmDto.mainInterlocutor,
    );

    await this.firmInterlocutorEntryService.save({
      firmId: savedFirm.id,
      interlocutorId: mainInterlocutor.id,
      isMain: true,
      position: createFirmDto.mainInterlocutor.position,
    });

    return savedFirm;
  }

  async saveMany(createFirmDtos: CreateFirmDto[]): Promise<FirmEntity[]> {
    let savedFirms: FirmEntity[];
    for (const dto of createFirmDtos) {
      const savedEntry = await this.save(dto);
      savedFirms.push(savedEntry);
    }
    return savedFirms;
  }

  async update(id: number, updateFirmDto: UpdateFirmDto): Promise<FirmEntity> {
    //check if new taxIdNumber already exists & throw error if so
    if (updateFirmDto.taxIdNumber) {
      const firm = await this.firmRepository.findByCondition({
        where: { taxIdNumber: updateFirmDto.taxIdNumber },
      });
      if (firm && firm.id !== id) {
        throw new TaxIdNumberDuplicateException();
      }
    }

    //find the existing firm
    const existingFirm = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'interlocutorsToFirm',
    });

    // update the main interlocutor by looking up in the firmInterlocutorEntry table
    const mainInterlocutorId = existingFirm.interlocutorsToFirm.find(
      (entry) => entry.isMain,
    ).interlocutorId;

    const existingMainInterlocutor =
      await this.interlocutorService.findOneByCondition({
        filter: `id||$eq||${mainInterlocutorId}`,
      });

    //update main interlocutor position independently
    this.firmInterlocutorEntryService.update(
      existingFirm.interlocutorsToFirm.find((entry) => entry.isMain).id,
      {
        firmId: existingFirm.id,
        interlocutorId: mainInterlocutorId,
        position: updateFirmDto.mainInterlocutor.position,
      },
    );

    this.interlocutorService.update(mainInterlocutorId, {
      ...existingMainInterlocutor,
      ...updateFirmDto.mainInterlocutor,
      //force undefined position to update the interlocutor entity
      position: undefined,
    });

    //invoicing address
    const invoicingAddress = updateFirmDto.invoicingAddress
      ? await this.addressService.findOneById(existingFirm.invoicingAddressId)
      : existingFirm.invoicingAddress;

    //update the invoicing address
    if (updateFirmDto.invoicingAddress) {
      await this.addressService.update(existingFirm.invoicingAddressId, {
        ...invoicingAddress,
        ...updateFirmDto.invoicingAddress,
      });
    }

    //delivery address
    const deliveryAddress = updateFirmDto.deliveryAddress
      ? await this.addressService.findOneById(existingFirm.deliveryAddressId)
      : existingFirm.deliveryAddress;

    //update the delivery address
    if (updateFirmDto.deliveryAddress) {
      await this.addressService.update(existingFirm.deliveryAddressId, {
        ...deliveryAddress,
        ...updateFirmDto.deliveryAddress,
      });
    }

    //activity
    const activity = await this.activityService.findOneById(
      updateFirmDto.activityId,
    );

    //currency
    const currency = await this.currencyService.findOneById(
      updateFirmDto.currencyId,
    );

    //payment condition
    const paymentCondition = await this.paymentConditionService.findOneById(
      updateFirmDto.paymentConditionId,
    );

    return this.firmRepository.save({
      ...existingFirm,
      ...updateFirmDto,
      activity,
      currency,
      paymentCondition,
    });
  }

  async handleRelatedEntities(id: number) {
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
        service: this.buyingPaymentService,
        name: 'BuyingPayment',
      },
      {
        service: this.sellingQuotationService,
        name: 'SellingQuotation',
      },
      {
        service: this.sellingInvoiceService,
        name: 'SellingInvoice',
      },
      {
        service: this.sellingPaymentService,
        name: 'SellingPayment',
      },
      {
        service: this.firmBankAccountService,
        name: 'FirmBankAccount',
      },
    ];
  
    for (const { service, name } of services) {
      const filter = [`firmId||$eq||${id}`];
      
  
      const relatedEntries = await service.findAll({ filter: filter.join(',') });
  
      for (const entry of relatedEntries) {
        await service.softDelete(entry.id)
      }
    }
    const firm= await this.findOneByCondition({
      filter:`id||$eq||${id}`,
      join:'interlocutorsToFirm'
    })
    firm.interlocutorsToFirm.map(async(entry)=>{
      await this.firmInterlocutorEntryService.softDelete(entry.id)
      const InterlocutorExist= await this.firmInterlocutorEntryService.findAllByInterlocutorId(entry.interlocutorId)
      if(InterlocutorExist.length===0) await this.interlocutorService.softDelete(entry.interlocutorId)
    })
  }
  

  async softDelete(id: number,password:string,userId:any):Promise<FirmEntity>{
    const user = await this.userService.findOneById(userId)
      if (!user) {
        throw new BadRequestException('User does not exist');
      }
  
      if (!(await bcrypt.compare(password, user.password))) {
        throw new BadRequestException('firm.errors.wrong_password');
      }
    
    await this.handleRelatedEntities(id)
    return this.firmRepository.softDelete(id);
  }

  async deleteAll() {
    return this.firmRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.firmRepository.getTotalCount();
  }


  async getTopSuppliers(limit = 3, dateFilter?: any): Promise<TopFirmDto[]> {
    const query = ( await this.buyingPaymentRepository
      .createQueryBuilder('payment'))
      .select([
        'firm.name as firmName',
        'SUM(payment.amount * payment.convertionRateToCabinet) as totalAmount',
        'firm.id as firmId'
      ])
      .innerJoin('payment.firm', 'firm')
      .groupBy('payment.firmId')
      .orderBy('totalAmount', 'DESC')
      .limit(limit);
  
    if (dateFilter) {
      query.andWhere({ date: dateFilter });
    }
  
    return query.getRawMany()
      .then(results =>
        results.map(r => ({
          id:r.firmId,
          name: r.firmName,
          amount: parseFloat(r.totalAmount)
        }))
      );
  }
  
  async getTopClients(limit = 3, dateFilter?: any): Promise<TopFirmDto[]> {
    const query = (await this.sellingPaymentRepository
      .createQueryBuilder('payment'))
      .select([
        'firm.name as firmName',
        'SUM(payment.amount * payment.convertionRateToCabinet) as totalAmount',
        'firm.id as firmId'
      ])
      .innerJoin('payment.firm', 'firm')
      .groupBy('payment.firmId')
      .orderBy('totalAmount', 'DESC')
      .limit(limit);
  
    if (dateFilter) {
      query.andWhere({ date: dateFilter });
    }
  
    return query.getRawMany()
      .then(results =>
        results.map(r => ({
          id:r.firmId,
          name: r.firmName,
          amount: parseFloat(r.totalAmount)
        }))
      );
  }
}
