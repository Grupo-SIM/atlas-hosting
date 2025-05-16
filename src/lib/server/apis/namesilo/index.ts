import axios, { type AxiosInstance } from "axios";
import type {
  CheckRegisterAvailabilityResponse,
  CreateContactParams,
  RegisterDomainParams,
} from "./types";

export class NamesiloApi {
  private apiKey: string;
  private api: AxiosInstance;

  constructor() {
    if (!process.env.NAMESILO_API_KEY) {
      throw new Error("NAMESILO_API_KEY is not set");
    }

    this.apiKey = process.env.NAMESILO_API_KEY;

    this.api = axios.create({
      baseURL: "https://www.namesilo.com/api",
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

    for (const key in newParams) {
      if (Array.isArray(newParams[key])) {
        newParams[key] = newParams[key].join(",");
      }
    }

    return newParams;
  }

  /**
	 * Checks if a domain is available for registration using the Namesilo API.
	 * @param domain - The domain name to check.
	 * @returns The response data from the API, or null if an error occurs.
	 */
  public async checkDomainAvailability(domain: string) {
    try {
      const { data } = await this.api.get<CheckRegisterAvailabilityResponse>(
        "/checkRegisterAvailability",
        {
          params: this.gqp({
            domains: [domain],
          }),
        },
      );

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error checking domain availability:",
          error.response?.data,
        );
      }
      console.trace(
        "Error checking domain availability:",
        JSON.stringify(error),
      );
      return null;
    }
  }

  public async registerDomain(params: RegisterDomainParams) {
    const { data } = await this.api.get("/registerDomain", {
      params: this.gqp({
        domain: params.domain,
        years: params.years
      }),
    });

    return data;
  }

  public async createContact({
    fn, ln, ad, cy, st, zp, ct, em, ph
  }: CreateContactParams) {
    const { data } = await this.api.get("/contactAdd", {
	  params: this.gqp({
        fn, ln, ad, cy, st, zp, ct, em, ph
	  }),
    });

    return data;
  }

}

type AxiosQueryParams = Record<string, string | number | string[] | unknown>;

const nameSilo = new NamesiloApi();

export default nameSilo;
