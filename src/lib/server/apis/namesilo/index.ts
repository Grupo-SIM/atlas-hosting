import axios, { ParamsSerializerOptions, type AxiosInstance } from "axios";
import {
  CreateContactResponse,
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
  private gqp(params: AxiosQueryParams): AxiosQueryParams {
    const defaultParams: AxiosQueryParams = {
      key: this.apiKey,
      type: "json",
      version: 1,
    };

    const newParams = Object.assign(
      {} as AxiosQueryParams,
      params,
      defaultParams,
    );

    return newParams;
  }

  private async get<T>(url: string, params?: AxiosQueryParams) {
    try {
      const { data } = await this.api.get<NamesiloResponse<T>>(url, {
        params: this.gqp({ ...params }),
        paramsSerializer: paramsSerializer,
      });

      if (data?.reply?.code !== 300) {
        console.error("Error in API response:", data);
        return null;
      }

      return data.reply;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error in API request:", error.response?.data);
      }
      console.error("Error in API request:", error);

      return null;
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
    const result =await this.get<NamesiloResponse<CreateContactResponse>>("/contactAdd", {
      fn, ln, ad, cy, st, zp, ct, em, ph
    });

    if (!result?.reply.contact_id) {
      throw new Error("Error creating contact");
    }

    return result.reply.contact_id;
  }

  public async getDomainPrices() {
    return this.get<GetPricesResponse>("/getPrices", {});
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
