import { Injectable } from '@nestjs/common';
import { CurrencyRepository } from '../repositories/repository/currency.repository';
import { CurrencyEntity } from '../repositories/entities/currency.entity';
import { CreateCurrencyDto } from '../dtos/currency.create.dto';
import { CurrencyNotFoundException } from '../errors/currency.notfound.error';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';


@Injectable()
export class CurrencyService {
  constructor(
    private readonly currencyRepository: CurrencyRepository,
    private readonly configService: ConfigService,
  ) {}

  async findOneById(id: number): Promise<CurrencyEntity> {
    const currency = await this.currencyRepository.findOneById(id);
    if (!currency) {
      throw new CurrencyNotFoundException();
    }
    return currency;
  }
  async findAll(): Promise<CurrencyEntity[]> {
    const currencies = await this.currencyRepository.findAll();

    // Get favorite currencies from config
    const favCurrencies = this.configService.get<Record<string, string>>(
      'app-preferences.currency',
    );
    const favoriteCurrencyCodes = Object.values(favCurrencies).filter(Boolean);

    // Create a map for quick look-up of favorite currency codes
    const favoriteCurrencyMap = new Set(favoriteCurrencyCodes);

    // Sort currencies: favorites first, then the rest
    const reorderedCurrencies = currencies.sort((a, b) => {
      const isAFavorite = favoriteCurrencyMap.has(a.code);
      const isBFavorite = favoriteCurrencyMap.has(b.code);

      if (isAFavorite && !isBFavorite) return -1; // a is a favorite, b is not
      if (!isAFavorite && isBFavorite) return 1; // b is a favorite, a is not
      return 0; // Both are favorites or neither are favorites, maintain original order
    });

    return reorderedCurrencies;
  }

  async save(createCurrencyDto: CreateCurrencyDto): Promise<CurrencyEntity> {
    return this.currencyRepository.save(createCurrencyDto);
  }

  async saveMany(
    createCurrencyDtos: CreateCurrencyDto[],
  ): Promise<CurrencyEntity[]> {
    return this.currencyRepository.saveMany(createCurrencyDtos);
  }

  async softDelete(id: number): Promise<CurrencyEntity> {
    await this.findOneById(id);
    return this.currencyRepository.softDelete(id);
  }

  async getTotal(): Promise<number> {
    return this.currencyRepository.getTotalCount();
  }

  async deleteAll() {
    return this.currencyRepository.deleteAll();
  }

// THIS IS THE REAL METHODE BUT I COMMENTED IT TO AVOID CALLING THE API THIS ENDPOINT IS FREE
//https://www.exchangerate-api.com/docs/overview

/*
  async getExchangeRate(from: string, to: string): Promise<number> {
    const access_key=this.configService.get('app.exangeRateApiAccessKey')
    const url = ` https://v6.exchangerate-api.com/v6/${access_key}/pair/${from}/${to}`
    const res = await axios.get(url);
    if (res.data && res.data.result === 'success') {
      return res.data.conversion_rate;
    }
    throw new Error('Exchange rate not available');
  }
}*/
  // THIS IS THE REAL METHODE BUT I COMMENTED IT TO AVOID CALLING THE API THIS ENDPOINT IS NOT FREE
/*
async getHistoExchangeRate(
    currency: string,
    cabinetCurrency: string,
    dateTime: Date
  ): Promise<number> {
    // Extraire les parties de la date
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // Les mois sont indexés à partir de 0
    const day = String(dateTime.getDate()).padStart(2, '0'); // Ajouter un zéro devant si nécessaire
    
    const access_key = this.configService.get('app.exangeRateApiAccessKey');
    const url = `https://v6.exchangerate-api.com/v6/${access_key}/history/${currency}/${year}/${month}/${day}`;
    const res = await axios.get(url);
      if (res.data && res.data.result === 'success') {
        return res.data.conversion_rate[cabinetCurrency];
      }
    throw new Error('Exchange rate not available');
  }
*/
getExchangeRate=(from: string, to: string)=> 3.5
getHistoExchangeRate = (currency: string,cabinetCurrency: string,dateTime: Date)=>3.5
}
