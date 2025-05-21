import axios, { ParamsSerializerOptions, type AxiosInstance } from "axios";
import {
  CreateContactResponse,
  ListDnsRecordsResponse,
  ListDomainsParams,
  ListNameServersResponse,
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

    return Object.entries(newParams)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          value = value.map((v) => v.toString()).join(",");
        }

        return [key, String(value)];
      })
      .filter(([, value]) => value !== undefined) as string[][];
  }

  private async get<T>(
    url: string,
    params?: AxiosQueryParams
  ): Promise<NamesiloReply<T>> {
    try {
      const queryParams = this.gqp({ ...params });
      const queryString = new URLSearchParams(queryParams);
      const fullUrl = `${url}?${queryString}`;

      const { data } = await this.api.get<NamesiloResponse<T>>(fullUrl, {
        headers: {
          Accept: "application/json",
        },
      });

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

      return null as unknown as NamesiloReply<T>;
    }
  }

  /**
   * Checks if a domain is available for registration using the Namesilo API.
   * @param domain - The domain name to check.
   * @returns The response data from the API, or null if an error occurs.
   */
  public async checkDomainAvailability<T extends string | string[]>(domain: T) {
    return this.get<CheckRegisterAvailabilityResponse<T>>(
      "/checkRegisterAvailability",
      {
        domains: domain,
      }
    );
  }

  public async registerDomain(params: RegisterDomainParams) {
    const result = await this.get("/registerDomain", {
      domain: params.domain,
      years: params.years,
      portfolio: params.portfolio,
      ns1: process.env.NS_1,
      ns2: process.env.NS_2,
    });

    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.unlockDomain(params.domain);
    })();

    return result;
  }

  public async createContact(): Promise<string> {
    const portfolio = crypto.randomUUID().replace(/-/g, "");

    const result = await this.get<NamesiloResponse<CreateContactResponse>>(
      "/portfolioAdd",
      {
        portfolio,
      }
    );

    if (result.code !== 300) {
      throw new Error(`Failed to create contact: ${result.detail}`);
    }

    return portfolio;
  }

  /**
   * Adds a new portfolio to Namesilo
   * @param portfolioName - The name of the portfolio to add (will be encoded)
   * @returns The response data from the API
   */
  public async addPortfolio(portfolioName: string) {
    return this.get("/portfolioAdd", {
      portfolio: portfolioName,
    });
  }

  public async getDomainInfo(domain: string) {
    return await this.get<NamesiloDomainInfo>("/getDomainInfo", {
      domain,
    });
  }

  public async getDomainPrices() {
    return this.get<GetPricesResponse>("/getPrices", {});
  }

  public async listDomains({ page, pageSize, portfolioId }: ListDomainsParams) {
    const params: Record<string, string | number> = {};

    if (page) {
      params.page = page;
    }

    if (pageSize) {
      params.pageSize = pageSize;
    }

    if (portfolioId) {
      params.portfolio = portfolioId;
    }

    const result = await this.get<NamesiloDomain>("/listDomains", params);

    return result;
  }

  public async addDnsRecord(params: {
    domain: string;
    type: string;
    host: string;
    value: string;
  }) {
    return await this.get("/dnsAddRecord", {
      domain: params.domain,
      rrtype: params.type,
      rrhost: params.host,
      rrvalue: params.value,
    });
  }

  public async updateDnsRecord(params: {
    domain: string;
    rrid: string;
    rrhost: string;
    rrvalue: string;
  }) {
    return await this.get("/dnsUpdateRecord", {
      domain: params.domain,
      rrid: params.rrid,
      rrhost: params.rrhost,
      rrvalue: params.rrvalue,
    });
  }

  public async changeNameServers(domain: string, nameServers: string[]) {
    return await this.get(
      "/setNameServers",
      Object.fromEntries([
        ["domain", domain],
        ...nameServers.map((ns, index) => [`ns${index + 1}`, ns]),
      ])
    );
  }

  public async dnsListRecords(domain: string) {
    return await this.get<ListDnsRecordsResponse>("/dnsListRecords", {
      domain,
    });
  }

  public async deleteDnsRecord(domain: string, recordId: string) {
    return await this.get("/dnsDeleteRecord", {
      domain,
      rrid: recordId,
    });
  }

  public async listRegisteredNameServers(domain: string) {
    return await this.get<ListNameServersResponse>(
      "/listRegisteredNameServers",
      {
        domain,
      }
    );
  }

  public async deleteRegisteredNameServer(domain: string, host: string) {
    return await this.get("/deleteRegisteredNameServer", {
      domain,
      current_host: host,
    });
  }

  private async unlockDomain(domain: string) {
    return await this.get("/domainUnlock", {
      params: { domain },
    });
  }
}

function paramsSerializer(
  params: Record<string, unknown>,
  options?: ParamsSerializerOptions
): string {
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
