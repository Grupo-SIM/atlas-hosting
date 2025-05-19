import axios, { ParamsSerializerOptions, type AxiosInstance } from "axios";
import {
  CreateContactResponse,
  ListDomainsParams,
  NamesiloDomain,
  NamesiloDomainInfo,
  NamesiloReply,
  type CheckRegisterAvailabilityResponse,
  type CreateContactParams,
  type GetPricesResponse,
  type NamesiloResponse,
  type RegisterDomainParams,
} from "./types";

export class NamesiloApi {
  private apiKey: string;
  private api: AxiosInstance;
  public profitFee: number;

  constructor() {
    this.apiKey = process.env.NAMESILO_API_KEY!;

    this.profitFee = Number.parseFloat(process.env.NAMESILO_PROFIT_FEE ?? "0");

    this.api = axios.create({
      baseURL: "https://www.namesilo.com/apibatch",
    });
  }

  /**
	 * Generates a query parameter object for the Namesilo API (gqp: Generate Query Params).
	 * @param params - The query parameters to include in the request.
	 * @returns An object containing the query parameters, including the API key.
	 */
  private gqp(params: AxiosQueryParams): string[][] {
    const defaultParams: AxiosQueryParams = {
      key: this.apiKey,
      type: "json",
      version: 1,
    };

    const newParams = { ...defaultParams, ...params };

    return Object.entries(newParams).map(([key, value]) => {
      if (Array.isArray(value)) {
        value = value.map(v => v.toString()).join(",")
      }

      return [key, String(value)];
    }).filter(([, value]) => value !== undefined) as string[][]
  }

  private async get<T>(url: string, params?: AxiosQueryParams): Promise<NamesiloReply<T>> {
    try {
      const queryParams = this.gqp({ ...params });
      const queryString = new URLSearchParams(queryParams);
      const fullUrl = `${url}?${queryString}`;

      const { data } = await this.api.get<NamesiloResponse<T>>(fullUrl);

      if (data.reply?.code !== 300) {
        console.error("Error in API response:", data);
        return data.reply;
      }

      return data.reply;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return error.response?.data;
      }
      console.error("Error in API request:", error);

      return null as any;
    }
  }

  /**
	 * Checks if a domain is available for registration using the Namesilo API.
	 * @param domain - The domain name to check.
	 * @returns The response data from the API, or null if an error occurs.
  */
  public async checkDomainAvailability<T extends string | string[]>(domain: T) {
    return this.get<CheckRegisterAvailabilityResponse<T>>("/checkRegisterAvailability", {
      domains: domain,
    });
  }

  public async registerDomain(params: RegisterDomainParams) {
    return this.get("/registerDomain", {
      domain: params.domain,
      years: params.years,
    });
  }

  public async createContact({
    fn, ln, ad, cy, st, zp, ct, em, ph
  }: CreateContactParams): Promise<number> {
    const result = await this.get<NamesiloResponse<CreateContactResponse>>("/contactAdd", {
      fn, ln, ad, cy, st, zp, ct, em, ph
    });

    const contactId = result.reply?.contact_id;

    if (contactId) {
      await this.addPortfolio(contactId.toString());
    }

    return contactId;
  }

  /**
   * Adds a new portfolio to Namesilo
   * @param portfolioName - The name of the portfolio to add (will be encoded)
   * @returns The response data from the API
   */
  public async addPortfolio(portfolioName: string) {
    return this.get("/portfolioAdd", {
      portfolio: portfolioName
    });
  }

  public async getDomainInfo(domain: string) {
    return await this.get<NamesiloDomainInfo>("/getDomainInfo", {
      domain
    });
  }

  public async getDomainPrices() {
    return this.get<GetPricesResponse>("/getPrices", {});
  }

  public async listDomains({
    page,
    pageSize,
    portfolioId
  }: ListDomainsParams) {
    const params: Record<string, string | number> = {};

    if (page) {
      params.page = page;
    }

    if (pageSize) {
      params.pageSize = pageSize
    }

    if (portfolioId) {
      params.portfolio = portfolioId
    }

    const result = await this.get<NamesiloDomain>("/listDomains", params)

    console.log(result);

    return result;
  }
}

function paramsSerializer(params: Record<string, unknown>, options?: ParamsSerializerOptions): string {
  const paramsArray = [];

  for (const key in params) {
    const value = params[key];
    if (Array.isArray(value)) {
      paramsArray.push(`${key}=${value.join(",")}`);
    } else {
      paramsArray.push(`${key}=${value}`);
    }
  }

  return paramsArray.join("&");
}

type AxiosQueryParams = Record<string, string | number | string[] | unknown>;

const nameSilo = new NamesiloApi();

export default nameSilo;
