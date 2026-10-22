import axios from "axios";
import { isSameDay } from "date-fns";

export class CurrencyConversionApi {
  private cache: CurrencyConversionCache = {};
  private api = axios.create({
    baseURL: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1",
    headers: {
      Accept: "application/json",
    },
  });

  private async getNewConversionRate(currency: string) {
    const { data } = await this.api.get<CurrencyApiResponse<string, string>>(
      `/currencies/${currency}.json`
    );

    return data[currency];
  }

  private async getConversionRate(
    currency: string
  ): Promise<Record<string, number>> {
    const cachedEntry = this.cache[currency];

    if (!cachedEntry || !isSameDay(cachedEntry.timestamp, Date.now())) {
      await this.updateCache(currency);
    }

    return this.cache[currency].data;
  }

  public async convert<T extends string = string, U extends string = string>({
    from,
    to,
    amount,
  }: ConvertCurrencyParams<T, U>): Promise<number> {
    const data = await this.getConversionRate(to);
    const converstionRate = data[from];
    return amount / converstionRate;
  }

  public async convertMultiple<
    T extends string = string,
    U extends string = string,
  >({ from, to, amounts }: ConvertMultipleParams<T, U>): Promise<number[]> {
    const data = await this.getConversionRate(to);
    const converstionRate = data[from];
    return amounts.map(amount => amount / converstionRate);
  }

  public async updateCache(currency: string): Promise<void> {
    const data = await this.getNewConversionRate(currency);

    this.cache[currency] = {
      data,
      timestamp: Date.now(),
    };
  }
}

type CurrencyApiResponse<T extends string, U extends string> = Record<
  T,
  Record<U, number>
>;

export interface ConvertCurrencyParams<
  T extends string = string,
  U extends string = string,
> {
  from: U;
  to: T;
  amount: number;
}

export interface ConvertMultipleParams<
  T extends string = string,
  U extends string = string,
> {
  from: U;
  to: T;
  amounts: number[];
}

export interface CurrencyConversionCacheEntry {
  data: Record<string, number>;
  timestamp: number;
}

export type CurrencyConversionCache = Record<
  string,
  CurrencyConversionCacheEntry
>;

const currencyConversion = new CurrencyConversionApi();

export default currencyConversion;
