import axios from "axios";

export class CurrencyConversionApi {
  private api = axios.create({
    baseURL: "https://latest.currency-api.pages.dev/v1",
    headers: {
      Accept: "application/json",
    },
  });

  public async convert<T extends string = string, U extends string = string>({
    from,
    to,
    amount,
  }: ConvertCurrencyParams<T, U>): Promise<number> {
    const { data } = await this.api.get<CurrencyApiResponse<T, U>>(
      `/currencies/${to}.json`,
    );
    const converstionRate = data[to][from];
    console.log({ converstionRate, amount });
    return amount / converstionRate;
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

const currencyConversion = new CurrencyConversionApi();
export default currencyConversion;
