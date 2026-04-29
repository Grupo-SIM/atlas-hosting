// lib/server/apis/namecheap/index.ts
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { isString, uniq } from "lodash";
import { parseStringPromise } from "xml2js";
import type {
  DnsHostRecordItem,
  DomainCheckResultItem,
  DomainListItem,
  DomainsCheckCleanedResponse,
  DomainsCheckUserParams,
  DomainsCreateCleanedResponse,
  DomainsCreateUserParams,
  DomainsDnsGetHostsCleanedResponse,
  DomainsDnsGetHostsUserParams,
  DomainsDnsSetHostsCleanedResponse,
  DomainsDnsSetHostsUserParams,
  DomainsGetInfoCleanedResponse,
  DomainsGetInfoUserParams,
  DomainsGetListCleanedResponse,
  DomainsGetListUserParams,
  DomainsGetTldListCleanedResponse,
  DomainsNsCreateCleanedResponse,
  DomainsNsCreateUserParams,
  DomainsRenewCleanedResponse,
  DomainsRenewUserParams,
  NamecheapContactDetails,
  NamecheapDnsDetails,
  NamecheapRequestParams,
  NamecheapWhoisguardInfo,
  PagingInfo,
  ProductCategoryPricingInfo,
  ProductPriceDetail,
  ProductPricingInfo,
  RawDomainsCheckCommandResponseContent,
  RawDomainsCreateCommandResponseContent,
  RawDomainsDnsGetHostsCommandResponseContent,
  RawDomainsDnsSetHostsCommandResponseContent,
  RawDomainsGetInfoCommandResponseContent,
  RawDomainsGetListCommandResponseContent,
  RawDomainsGetTldListCommandResponseContent,
  RawDomainsNsCreateCommandResponseContent,
  RawDomainsRenewCommandResponseContent,
  RawNamecheapApiResponse,
  RawUsersCreateCommandResponseContent,
  RawUsersGetPricingCommandResponseContent,
  TldListItem,
  UsersCreateCleanedResponse,
  UsersCreateUserParams,
  UsersGetPricingCleanedResponse,
  UsersGetPricingUserParams,
} from "./types";


const TARGET_CURRENCY = "USD";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export class NamecheapApiWrapper {
  private axiosInstance: AxiosInstance;
  private readonly apiUser = process.env.NAMECHEAP_API_USER as string;
  private readonly apiKey = process.env.NAMECHEAP_API_KEY as string;
  private readonly userName: string;
  private readonly clientIp = process.env.PUBLIC_IP as string;
  private readonly baseUrl = "https://api.namecheap.com/xml.response";
  private pricingCache: Map<string, { data: UsersGetPricingCleanedResponse | null, timestamp: number }> = new Map();
  private readonly PRICING_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private db = db;
  private domainPricingCacheTable = schema.pgDomainPricingCache;

  private tldListApiCache: {
    value: DomainsGetTldListCleanedResponse | null;
    lastUpdated: number;
    isFetching: boolean;
    fetchPromise: Promise<DomainsGetTldListCleanedResponse | null> | null;
  } = { value: null, lastUpdated: 0, isFetching: false, fetchPromise: null };

  private tldListApiRefreshInterval: NodeJS.Timeout | null = null;

  private domainPricingApiCache: {
    value: UsersGetPricingCleanedResponse | null;
    lastUpdated: number;
    isFetching: boolean;
    fetchPromise: Promise<UsersGetPricingCleanedResponse | null> | null;
  } = { value: null, lastUpdated: 0, isFetching: false, fetchPromise: null };

  private dbDomainPricesLastRefreshed = 0;
  private dbDomainPricingRefreshInterval: NodeJS.Timeout | null = null;
  private isDbDomainPricingRefreshing = false;
  private dbRefreshPromise: Promise<void> | null = null;

  constructor(userName: string) {
    this.userName = userName;
    // Não definir Content-Type no cliente global: em GET isso quebra negociação
    // (406 + HTML) em alguns proxies/CDNs. POST define Content-Type por requisição.
    this.axiosInstance = axios.create({
      timeout: 60_000,
      headers: {
        Accept: "application/xml, text/xml;q=0.9, */*;q=0.8",
      },
    });
  }

  private async _initializeTldApiCacheAndInterval(): Promise<void> {
    console.log(
      "NamecheapApiWrapper: Initializing TLD List API (in-memory) cache..."
    );
    await this._fetchAndCacheTldListApi();
    if (this.tldListApiRefreshInterval)
      clearInterval(this.tldListApiRefreshInterval);
    this.tldListApiRefreshInterval = setInterval(async () => {
      console.log(
        "NamecheapApiWrapper: Refreshing TLD List API (in-memory) cache."
      );
      await this._fetchAndCacheTldListApi();
    }, CACHE_DURATION_MS);
  }

  private async _initializeDbDomainPricingCacheAndInterval(): Promise<void> {
    console.log("NamecheapApiWrapper: Initializing Domain Pricing DB Cache...");
    await this._refreshDomainPricingDbCache();
    if (this.dbDomainPricingRefreshInterval)
      clearInterval(this.dbDomainPricingRefreshInterval);
    this.dbDomainPricingRefreshInterval = setInterval(async () => {
      console.log("NamecheapApiWrapper: Refreshing Domain Pricing DB Cache.");
      await this._refreshDomainPricingDbCache();
    }, CACHE_DURATION_MS);
  }

  private async _convertPrice(
    amount: number,
    fromCurrency: string
  ): Promise<number> {
    if (fromCurrency.toUpperCase() === TARGET_CURRENCY || amount === 0)
      return amount;
    try {
      return await currencyConversion.convert({
        from: fromCurrency.toLowerCase(),
        to: TARGET_CURRENCY.toLowerCase(),
        amount,
      });
    } catch (error) {
      console.error(
        `Currency conversion failed for ${amount} ${fromCurrency} to ${TARGET_CURRENCY}:`,
        error
      );
      return amount;
    }
  }

  private async _fetchAndCacheTldListApi(): Promise<DomainsGetTldListCleanedResponse | null> {
    if (this.tldListApiCache.isFetching && this.tldListApiCache.fetchPromise)
      return this.tldListApiCache.fetchPromise;
    this.tldListApiCache.isFetching = true;
    console.log("NCW: Fetching TLD list (metadata) for in-memory cache...");
    this.tldListApiCache.fetchPromise = (async () => {
      try {
        const freshTldList = await this._makeRequest<
          RawDomainsGetTldListCommandResponseContent,
          DomainsGetTldListCleanedResponse
        >(
          "namecheap.domains.getTldList",
          {},
          this._parseDomainsGetTldListResponse,
          "GET"
        );
        if (freshTldList?.Tlds?.length) {
          this.tldListApiCache.value = freshTldList;
          this.tldListApiCache.lastUpdated = Date.now();
          return freshTldList;
        }
        return this.tldListApiCache.value;
      } catch (error) {
        console.error("NCW: Error TLD API fetch (in-memory):", error);
        return this.tldListApiCache.value;
      } finally {
        this.tldListApiCache.isFetching = false;
        this.tldListApiCache.fetchPromise = null;
      }
    })();
    return this.tldListApiCache.fetchPromise;
  }

  private async _fetchAndCacheFullDomainPricing(): Promise<UsersGetPricingCleanedResponse | null> {
    if (
      this.domainPricingApiCache.isFetching &&
      this.domainPricingApiCache.fetchPromise
    )
      return this.domainPricingApiCache.fetchPromise;
    this.domainPricingApiCache.isFetching = true;
    console.log("NCW: Fetching Full Domain Pricing for in-memory cache...");
    this.domainPricingApiCache.fetchPromise = (async () => {
      try {
        const params: UsersGetPricingUserParams = { ProductType: "DOMAIN" };
        const freshPricing = await this._makeRequest<
          RawUsersGetPricingCommandResponseContent,
          UsersGetPricingCleanedResponse
        >(
          "namecheap.users.getPricing",
          this._parseUsersGetPricingParams(params),
          this._parseUsersGetPricingResponse,
          "GET"
        );
        if (freshPricing?.ProductType) {
          this.domainPricingApiCache.value = freshPricing;
          this.domainPricingApiCache.lastUpdated = Date.now();
          this._refreshDomainPricingDbCache().catch((err) =>
            console.error(
              "NCW: Background DB domain pricing cache refresh failed:",
              err
            )
          );
          return freshPricing;
        }
        return this.domainPricingApiCache.value;
      } catch (error) {
        console.error(
          "NCW: Error Full Domain Pricing API fetch (in-memory):",
          error
        );
        return this.domainPricingApiCache.value;
      } finally {
        this.domainPricingApiCache.isFetching = false;
        this.domainPricingApiCache.fetchPromise = null;
      }
    })();
    return this.domainPricingApiCache.fetchPromise;
  }

  private async _refreshDomainPricingDbCache(): Promise<void> {
    if (this.isDbDomainPricingRefreshing && this.dbRefreshPromise)
      return this.dbRefreshPromise;
    this.isDbDomainPricingRefreshing = true;
    console.log("NCW: Refreshing Domain Pricing DB Cache (USD prices)...");
    this.dbRefreshPromise = (async () => {
      try {
        const rawPricingParams: UsersGetPricingUserParams = {
          ProductType: "DOMAIN",
        };
        const rawPricingApiResponse = await this._makeRequest<
          RawUsersGetPricingCommandResponseContent,
          RawUsersGetPricingCommandResponseContent
        >(
          "namecheap.users.getPricing",
          this._parseUsersGetPricingParams(rawPricingParams),
          (rawContent) => rawContent,
          "GET"
        );

        const productTypeNode =
          rawPricingApiResponse?.UserGetPricingResult?.[0]?.ProductType?.[0];
        if (!productTypeNode?.ProductCategory) {
          console.warn(
            "NCW: No pricing data categories to process for DB cache refresh."
          );
          return;
        }

        const tldListMetaData = await this.getTldList();
        const tldMetaDataMap = new Map<
          string,
          { minReg?: number; maxReg?: number }
        >();

        for (const tld of tldListMetaData?.Tlds ?? []) {
          tldMetaDataMap.set(tld.Name.toLowerCase(), {
            minReg: tld.MinRegisterYears,
            maxReg: tld.MaxRegisterYears,
          });
        }

        const upsertData: schema.DomainPricingInsert[] = [];

        for (const category of productTypeNode.ProductCategory) {
          const actionType = category.$.Name.toUpperCase();

          for (const product of category.Product ?? []) {
            const tld = product.$.Name.toLowerCase();
            const oneYearPriceDetail = product.Price?.find(
              (p) => p.$.Duration === "1" && p.$.DurationType === "YEAR"
            );

            if (
              oneYearPriceDetail &&
              oneYearPriceDetail.$.Currency.toUpperCase() === "USD"
            ) {
              const currentEntry = upsertData.find((item) => item.tld === tld);
              const priceUSD = Number.parseFloat(oneYearPriceDetail.$.Price);
              const meta = tldMetaDataMap.get(tld);

              if (currentEntry) {
                if (actionType === "REGISTER") currentEntry.price = priceUSD;
                else if (actionType === "RENEW") currentEntry.renew = priceUSD;
                else if (actionType === "TRANSFER")
                  currentEntry.transfer = priceUSD;
              } else {
                upsertData.push({
                  tld: tld,
                  price: actionType === "REGISTER" ? priceUSD : undefined,
                  renew: actionType === "RENEW" ? priceUSD : undefined,
                  transfer: actionType === "TRANSFER" ? priceUSD : undefined,
                  minRegisterYears: meta?.minReg,
                  maxRegisterYears: meta?.maxReg,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }
            }
          }
        }

        if (upsertData.length > 0) {
          console.log(
            `NCW: Upserting ${upsertData.length} TLD prices (USD) to DB cache...`
          );
          for (const data of upsertData) {
            const valuesToUpsert: schema.DomainPricingInsert = {
              tld: data.tld as string,
              price: data.price ?? null,
              renew: data.renew ?? null,
              transfer: data.transfer ?? null,
              minRegisterYears: data.minRegisterYears ?? null,
              maxRegisterYears: data.maxRegisterYears ?? null,
              createdAt: data.createdAt as Date,
              updatedAt: data.updatedAt as Date,
            };

            await this.db
              .insert(this.domainPricingCacheTable)
              .values(valuesToUpsert)
              .onConflictDoUpdate({
                target: this.domainPricingCacheTable.tld,
                set: {
                  price: valuesToUpsert.price,
                  renew: valuesToUpsert.renew,
                  transfer: valuesToUpsert.transfer,
                  minRegisterYears: valuesToUpsert.minRegisterYears,
                  maxRegisterYears: valuesToUpsert.maxRegisterYears,
                  updatedAt: new Date(),
                },
              });
          }
          this.dbDomainPricesLastRefreshed = Date.now();
          console.log("NCW: Domain Pricing DB Cache refresh completed.");
        } else {
          console.log(
            "NCW: No data prepared for DB upsert in pricing refresh."
          );
        }
      } catch (error) {
        console.error(
          "NCW: Error during Domain Pricing DB Cache refresh:",
          error
        );
      } finally {
        this.isDbDomainPricingRefreshing = false;
        this.dbRefreshPromise = null;
      }
    })();
    return this.dbRefreshPromise;
  }

  private _makeRequest = async <TCommandResponseContent, TCleanedResponse>(
    command: string,
    methodParams: NamecheapRequestParams,
    parseResponseFunction: (
      rawCommandResponse: TCommandResponseContent
    ) => Promise<TCleanedResponse> | TCleanedResponse,
    httpMethod: "GET" | "POST" = "GET"
  ): Promise<TCleanedResponse> => {
    const allParams: NamecheapRequestParams = {
      ApiUser: this.apiUser,
      ApiKey: this.apiKey,
      UserName: this.userName,
      ClientIp: this.clientIp,
      Command: command,
      ...methodParams,
    };
    try {
      let response: AxiosResponse<string>;
      if (httpMethod === "POST") {
        const formData = new URLSearchParams();
        for (const key in allParams)
          if (allParams[key] !== undefined)
            formData.append(key, String(allParams[key]));
        response = await this.axiosInstance.post(this.baseUrl, formData, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/xml",
          },
        });
      } else {
        response = await this.axiosInstance.get(this.baseUrl, {
          params: allParams,
        });
      }
      const parsedXml: RawNamecheapApiResponse<TCommandResponseContent> =
        await parseStringPromise(response.data, { explicitArray: true });
      if (!parsedXml.ApiResponse)
        throw new Error("Invalid API response: ApiResponse root missing.");
      if (parsedXml.ApiResponse.$.Status === "ERROR") {
        let errMsg = `NC API Error for ${command}.`;
        const errNode = parsedXml.ApiResponse.Errors?.[0];
        if (typeof errNode === "object" && errNode.Error) {
          errMsg += errNode.Error.map((e) => ` Err ${e.$.Number}: ${e._}`).join(
            "; "
          );

          // Specific check for IP whitelist error (5050166)
          const ipError = errNode.Error.find((e) => e.$.Number === "5050166");
          if (ipError) {
            const ipMatch = ipError._.match(/(\d+\.\d+\.\d+\.\d+)/);
            const detectedIP = ipMatch ? ipMatch[1] : "desconhecido";
            throw new Error(`Invalid request IP: ${detectedIP}. O IP ${detectedIP} precisa ser adicionado à whitelist da Namecheap.`);
          }
        } else if (typeof errNode === "string" && errNode.trim())
          // Use isString from lodash if preferred
          errMsg += ` Details: ${errNode}`;
        else if (parsedXml.ApiResponse.Errors)
          errMsg += ` Raw Errors: ${JSON.stringify(parsedXml.ApiResponse.Errors)}`;

        // Specific error code checks for setHosts (example)
        // Error codes specific to setHosts like 2030167, 2030280 etc. can be checked here
        // For now, appending the known "Unknown exception"
        if (
          !isString(errNode) &&
          errNode?.Error?.some((e) => e.$.Number === "5050169")
        ) {
          errMsg += " (Unknown exception)";
        }
        throw new Error(errMsg);
      }
      const cmdRespObj = parsedXml.ApiResponse.CommandResponse?.[0];
      if (!cmdRespObj)
        throw new Error(`CommandResponse missing for ${command}.`);
      return parseResponseFunction(cmdRespObj as TCommandResponseContent);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        let errDetails = error.message;
        if (error.response)
          errDetails += ` | Status: ${error.response.status} | Data: ${String(error.response.data).substring(0, 200)}`;
        throw new Error(
          `Axios request failed for ${command} (${httpMethod}): ${errDetails}`
        );
      }
      throw error;
    }
  };

  // --- Method 1: namecheap.domains.check ---
  private _parseDomainsCheckParams = (
    params: DomainsCheckUserParams
  ): NamecheapRequestParams => ({ DomainList: params.DomainList });

  private _parseDomainsCheckResponse = async (
    rawContent: RawDomainsCheckCommandResponseContent
  ): Promise<DomainsCheckCleanedResponse> => {
    const results: DomainCheckResultItem[] = [];
    if (rawContent.DomainCheckResult) {
      for (const rawResult of rawContent.DomainCheckResult) {
        const attrs = rawResult.$;
        const originalCurrency = "USD";
        results.push({
          Domain: attrs.Domain,
          Available: attrs.Available === "true",
          ErrorNo: attrs.ErrorNo !== "0" ? attrs.ErrorNo : undefined,
          Description: attrs.Description || undefined,
          IsPremiumName: attrs.IsPremiumName === "true",
          PremiumRegistrationPrice: await this._convertPrice(
            Number.parseFloat(String(attrs.PremiumRegistrationPrice || "0").replace(/,/g, "")),
            originalCurrency
          ),
          PremiumRenewalPrice: await this._convertPrice(
            Number.parseFloat(String(attrs.PremiumRenewalPrice || "0").replace(/,/g, "")),
            originalCurrency
          ),
          PremiumRestorePrice: await this._convertPrice(
            Number.parseFloat(String(attrs.PremiumRestorePrice || "0").replace(/,/g, "")),
            originalCurrency
          ),
          PremiumTransferPrice: await this._convertPrice(
            Number.parseFloat(String(attrs.PremiumTransferPrice || "0").replace(/,/g, "")),
            originalCurrency
          ),
          IcannFee: await this._convertPrice(
            Number.parseFloat(String(attrs.IcannFee || "0").replace(/,/g, "")),
            originalCurrency
          ),
          EapFee: await this._convertPrice(
            Number.parseFloat(String(attrs.EapFee || "0").replace(/,/g, "")),
            originalCurrency
          ),
        });
      }
    }
    return { Results: results };
  };

  public async check(
    params: DomainsCheckUserParams
  ): Promise<DomainsCheckCleanedResponse> {
    return await this._makeRequest(
      "namecheap.domains.check",
      this._parseDomainsCheckParams(params),
      this._parseDomainsCheckResponse,
      "GET"
    );
  }

  // --- Method for namecheap.domains.getList ---
  private _parseDomainsGetListParams = (
    params: DomainsGetListUserParams
  ): NamecheapRequestParams => {
    const apiParams: NamecheapRequestParams = {};
    if (params.ListType) apiParams.ListType = params.ListType;
    if (params.SearchTerm) apiParams.SearchTerm = params.SearchTerm;
    if (params.Page) apiParams.Page = params.Page;
    if (params.PageSize) apiParams.PageSize = params.PageSize;
    if (params.SortBy) apiParams.SortBy = params.SortBy;
    return apiParams;
  };

  private _parseDomainsGetListResponse = (
    rawContent: RawDomainsGetListCommandResponseContent
  ): DomainsGetListCleanedResponse => {
    const domains: DomainListItem[] = [];
    const rawDomainList = rawContent.DomainGetListResult?.[0]?.Domain;

    if (rawDomainList) {
      for (const d of rawDomainList) {
        const attrs = d.$;
        domains.push({
          ID: Number.parseInt(attrs.ID),
          Name: attrs.Name,
          User: attrs.User,
          Created: attrs.Created,
          Expires: attrs.Expires,
          IsExpired: attrs.IsExpired === "true",
          IsLocked: attrs.IsLocked === "true",
          AutoRenew: attrs.AutoRenew === "true",
          WhoisGuard: attrs.WhoisGuard,
          IsPremium: attrs.IsPremium === "true",
          IsOurDNS: attrs.IsOurDNS === "true",
        });
      }
    }

    const rawPaging = rawContent.Paging?.[0];
    const paging: PagingInfo = {
      TotalItems: rawPaging?.TotalItems?.[0]
        ? Number.parseInt(rawPaging.TotalItems[0])
        : 0,
      CurrentPage: rawPaging?.CurrentPage?.[0]
        ? Number.parseInt(rawPaging.CurrentPage[0])
        : 1,
      PageSize: rawPaging?.PageSize?.[0]
        ? Number.parseInt(rawPaging.PageSize[0])
        : 0,
    };

    return { Domains: domains, Paging: paging };
  };

  public getList = async (
    params: DomainsGetListUserParams = { PageSize: 100, Page: 1 }
  ): Promise<DomainsGetListCleanedResponse> => {
    try {
      return this._makeRequest<
        RawDomainsGetListCommandResponseContent,
        DomainsGetListCleanedResponse
      >(
        "namecheap.domains.getList",
        this._parseDomainsGetListParams(params),
        this._parseDomainsGetListResponse,
        "GET"
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          // parse xml error
          const parsedXml: RawNamecheapApiResponse<RawDomainsGetListCommandResponseContent> =
            await parseStringPromise(error.response.data, {
              explicitArray: true,
            });

          if (parsedXml.ApiResponse) {
            const errNode = parsedXml.ApiResponse.Errors?.[0];
            if (typeof errNode === "object" && errNode.Error) {
              throw new Error(errNode.Error[0].$.Number);
            }

            if (typeof errNode === "string" && errNode.trim()) {
              throw new Error(`Namecheap API error: ${errNode}`);
            }

            if (parsedXml.ApiResponse.Errors) {
              throw new Error(
                `Namecheap API error: ${JSON.stringify(parsedXml.ApiResponse.Errors)}`
              );
            }

            throw new Error(
              `Namecheap API error: ${parsedXml.ApiResponse.$.Status}`
            );
          }
        }
      }

      throw error;
    }
  };

  // --- START: Added for namecheap.domains.dns.setHosts ---
  private _parseDomainsDnsSetHostsParams = (
    params: DomainsDnsSetHostsUserParams
  ): NamecheapRequestParams => {
    const apiParams: NamecheapRequestParams = {
      SLD: params.SLD,
      TLD: params.TLD,
    };

    if (params.EmailType) {
      apiParams.EmailType = params.EmailType;
    }

    params.Records.forEach((record, index) => {
      const recordNum = index + 1;
      apiParams[`HostName${recordNum}`] = record.HostName;
      apiParams[`RecordType${recordNum}`] = record.RecordType;
      apiParams[`Address${recordNum}`] = record.Address;
      if (record.MXPref !== undefined) {
        // Specifically check for undefined, as 0 is a valid MXPref
        apiParams[`MXPref${recordNum}`] = record.MXPref;
      }
      if (record.TTL !== undefined) {
        apiParams[`TTL${recordNum}`] = record.TTL;
      }
    });

    return apiParams;
  };

  private _parseDomainsDnsSetHostsResponse = (
    rawContent: RawDomainsDnsSetHostsCommandResponseContent
  ): DomainsDnsSetHostsCleanedResponse => {
    const resultNode = rawContent.DomainDNSSetHostsResult?.[0];
    if (!resultNode || !resultNode.$) {
      throw new Error(
        "DomainDNSSetHostsResult missing or malformed in API response."
      );
    }
    const attrs = resultNode.$;
    return {
      Domain: attrs.Domain,
      IsSuccess: attrs.IsSuccess === "true",
    };
  };

  public setHosts = async (
    params: DomainsDnsSetHostsUserParams
  ): Promise<DomainsDnsSetHostsCleanedResponse> => {
    const httpMethod = params.Records.length > 10 ? "POST" : "GET";
    // As per documentation: "We recommend you use HTTPPOST method when setting more than 10 hostnames."
    // "All host records that are not included into the API call will be deleted, so add them in addition to new host records."
    // This means the `params.Records` should be the complete list of desired records.

    return this._makeRequest<
      RawDomainsDnsSetHostsCommandResponseContent,
      DomainsDnsSetHostsCleanedResponse
    >(
      "namecheap.domains.dns.setHosts",
      this._parseDomainsDnsSetHostsParams(params),
      this._parseDomainsDnsSetHostsResponse,
      httpMethod
    );
  };
  // --- END: Added for namecheap.domains.dns.setHosts ---

  // --- Method 4: namecheap.domains.getTldList ---
  private _parseDomainsGetTldListResponse = (
    rawContent: RawDomainsGetTldListCommandResponseContent
  ): DomainsGetTldListCleanedResponse => {
    const tlds: TldListItem[] = [];
    const rawTldArray = rawContent.Tlds?.[0]?.Tld;
    if (rawTldArray) {
      for (const rt of rawTldArray) {
        const attrs = rt.$;
        const desc = rt._ || "";

        tlds.push({
          Name: attrs.Name,
          Description: desc.trim(),
          NonRealTime: attrs.NonRealTime === "true",
          MinRegisterYears: Number.parseInt(attrs.MinRegisterYears),
          MaxRegisterYears: Number.parseInt(attrs.MaxRegisterYears),
          MinRenewYears: Number.parseInt(attrs.MinRenewYears),
          MaxRenewYears: Number.parseInt(attrs.MaxRenewYears),
          MinTransferYears: Number.parseInt(attrs.MinTransferYears),
          MaxTransferYears: Number.parseInt(attrs.MaxTransferYears),
          IsApiRegisterable: attrs.IsApiRegisterable === "true",
          IsApiRenewable: attrs.IsApiRenewable === "true",
          IsApiTransferable: attrs.IsApiTransferable === "true",
          IsEppRequired: attrs.IsEppRequired === "true",
          IsDisableModContact: attrs.IsDisableModContact === "true",
          IsDisableWGAllot: attrs.IsDisableWGAllot === "true",
          IsIncludeInExtendedSearchOnly:
            attrs.IsIncludeInExtendedSearchOnly === "true",
          SequenceNumber: Number.parseInt(attrs.SequenceNumber),
          Type: attrs.Type,
          IsSupportsIDN: attrs.IsSupportsIDN === "true",
          Category: attrs.Category,
          IsDisableModifications: attrs.IsDisableModifications === "true",
          SupportsRegistrarLock: attrs.SupportsRegistrarLock === "true",
          AddGracePeriodDays: attrs.AddGracePeriodDays
            ? Number.parseInt(attrs.AddGracePeriodDays)
            : 0,
          WhoisVerification: attrs.WhoisVerification === "true",
          ProviderApiDelete: attrs.ProviderApiDelete === "true",
        });
      }
    }
    return { Tlds: tlds };
  };

  public getTldList =
    async (): Promise<DomainsGetTldListCleanedResponse | null> => {
      const now = Date.now();
      const isCacheStale =
        !this.tldListApiCache.value ||
        now - this.tldListApiCache.lastUpdated > CACHE_DURATION_MS;
      if (isCacheStale) {
        if (
          this.tldListApiCache.isFetching &&
          this.tldListApiCache.fetchPromise
        )
          return this.tldListApiCache.fetchPromise;
        return this._fetchAndCacheTldListApi();
      }
      return this.tldListApiCache.value;
    };

  // --- Method 5: namecheap.users.getPricing ---
  private _parseUsersGetPricingParams = (
    params: UsersGetPricingUserParams
  ): NamecheapRequestParams => {
    const p: NamecheapRequestParams = { ProductType: params.ProductType };
    if (params.ProductCategory) p.ProductCategory = params.ProductCategory;
    if (params.ProductName) p.ProductName = params.ProductName;
    if (params.ActionName) p.ActionName = params.ActionName;
    if (params.PromotionCode) p.PromotionCode = params.PromotionCode;
    return p;
  };

  private _parseUsersGetPricingResponse = async (
    rawContent: RawUsersGetPricingCommandResponseContent
  ): Promise<UsersGetPricingCleanedResponse> => {
    const rawProdTypeNode =
      rawContent.UserGetPricingResult?.[0]?.ProductType?.[0];
    if (!rawProdTypeNode) return { ProductType: null };

    const categories: ProductCategoryPricingInfo[] = [];

    if (rawProdTypeNode.ProductCategory) {
      for (const rawCategory of rawProdTypeNode.ProductCategory) {
        const products: ProductPricingInfo[] = [];

        if (rawCategory.Product) {
          for (const rawProduct of rawCategory.Product) {
            const prices: ProductPriceDetail[] = [];
            if (rawProduct.Price) {
              for (const rawPrice of rawProduct.Price) {
                const pAttrs = rawPrice.$;
                const originalCurrency = pAttrs.Currency.toUpperCase();
                prices.push({
                  Duration: Number.parseInt(pAttrs.Duration),
                  DurationType: pAttrs.DurationType,
                  Price: await this._convertPrice(
                    Number.parseFloat(pAttrs.Price),
                    originalCurrency
                  ),
                  RegularPrice: await this._convertPrice(
                    Number.parseFloat(pAttrs.RegularPrice),
                    originalCurrency
                  ),
                  YourPrice: await this._convertPrice(
                    Number.parseFloat(pAttrs.YourPrice),
                    originalCurrency
                  ),
                  CouponPrice: pAttrs.CouponPrice
                    ? await this._convertPrice(
                      Number.parseFloat(pAttrs.CouponPrice),
                      originalCurrency
                    )
                    : 0,
                  Currency: TARGET_CURRENCY as "BRL",
                });
              }
            }
            products.push({ Name: rawProduct.$.Name, Prices: prices });
          }
        }
        categories.push({ Name: rawCategory.$.Name, Products: products });
      }
    }
    return {
      ProductType: {
        Name: rawProdTypeNode.$
          .Name as UsersGetPricingUserParams["ProductType"],
        Categories: categories,
      },
    };
  };

  public async getPricings(domains: string[]) {
    const tlds = uniq(
      domains.map((domain) => domain.split(".").pop() as string)
    );

    return await Promise.all(tlds.map(this.getPricing));
  }

  public async getPricing(tld: string): Promise<UsersGetPricingCleanedResponse | null> {
    const cached = this.pricingCache.get(tld);
    if (cached && Date.now() - cached.timestamp < this.PRICING_CACHE_TTL) {
      return cached.data;
    }

    const apiParams = this._parseUsersGetPricingParams({
      ProductType: "DOMAIN",
      ProductName: tld,
    });

    const response = await this._makeRequest<
      RawUsersGetPricingCommandResponseContent,
      UsersGetPricingCleanedResponse
    >(
      "namecheap.users.getPricing",
      apiParams,
      this._parseUsersGetPricingResponse,
      "GET"
    );

    this.pricingCache.set(tld, { data: response, timestamp: Date.now() });
    return response;
  }

  /**
   * Public method to force refresh of domain pricing database cache
   * This will fetch all domain pricing from Namecheap and populate the database
   */
  public async refreshDomainPricingCache(): Promise<void> {
    await this._fetchAndCacheFullDomainPricing();
    // Wait for DB cache refresh to complete
    if (this.dbRefreshPromise) {
      await this.dbRefreshPromise;
    }
  }

  // --- Method 6: namecheap.domains.create ---
  private _flattenContactDetails = (
    contact: NamecheapContactDetails,
    prefix: string
  ): NamecheapRequestParams => {
    const p: NamecheapRequestParams = {};
    p[`${prefix}FirstName`] = contact.FirstName;
    p[`${prefix}LastName`] = contact.LastName;
    if (contact.OrganizationName)
      p[`${prefix}OrganizationName`] = contact.OrganizationName;
    p[`${prefix}Address1`] = contact.Address1;
    if (contact.Address2) p[`${prefix}Address2`] = contact.Address2;
    p[`${prefix}City`] = contact.City;
    p[`${prefix}StateProvince`] = contact.StateProvince;
    p[`${prefix}PostalCode`] = contact.PostalCode;
    p[`${prefix}Country`] = contact.Country;
    p[`${prefix}Phone`] = contact.Phone;
    p[`${prefix}EmailAddress`] = contact.EmailAddress;
    return p;
  };

  private _parseDomainsCreateParams = (
    params: DomainsCreateUserParams
  ): NamecheapRequestParams => {
    let apiParams: NamecheapRequestParams = {
      DomainName: params.DomainName,
      Years: params.Years,
    };
    apiParams = {
      ...apiParams,
      ...this._flattenContactDetails(params.Registrant, "Registrant"),
      ...this._flattenContactDetails(params.Admin, "Admin"),
      ...this._flattenContactDetails(params.Tech, "Tech"),
      ...this._flattenContactDetails(params.AuxBilling, "AuxBilling"),
    };
    if (params.AddFreeWhoisguard)
      apiParams.AddFreeWhoisguard = params.AddFreeWhoisguard;
    if (params.WGEnabled) apiParams.WGEnabled = params.WGEnabled;
    if (params.IdnCode) apiParams.IdnCode = params.IdnCode;
    if (params.IsPremiumDomain !== undefined) {
      apiParams.IsPremiumDomain = params.IsPremiumDomain ? "true" : "false";
      if (params.IsPremiumDomain && params.PremiumPrice !== undefined)
        apiParams.PremiumPrice = params.PremiumPrice;
    }
    if (params.EapFee !== undefined) apiParams.EapFee = params.EapFee;
    if (params.GenerateAdminOrderRefId !== undefined)
      apiParams.GenerateAdminOrderRefId = params.GenerateAdminOrderRefId
        ? "True"
        : "False";
    if (params.Nameservers !== undefined) {
      apiParams.Nameservers = params.Nameservers.join(",");
    }
    return apiParams;
  };

  private _parseDomainsCreateResponse = async (
    rawContent: RawDomainsCreateCommandResponseContent
  ): Promise<DomainsCreateCleanedResponse> => {
    // DomainCreateResult is an array due to xml2js explicitArray:true
    const resultNode = rawContent.DomainCreateResult?.[0];
    if (!resultNode || !resultNode.$) {
      // Check if the first element and its attributes exist
      throw new Error("DomainCreateResult missing or malformed.");
    }
    const res = resultNode.$; // Attributes are on the '$' property of the element
    const originalCurrency = "USD";
    const chargedAmountBRL = await this._convertPrice(
      Number.parseFloat(res.ChargedAmount),
      originalCurrency
    );
    return {
      Domain: res.Domain,
      Registered: res.Registered === "true",
      ChargedAmount: chargedAmountBRL,
      DomainID: res.DomainID ? Number.parseInt(res.DomainID) : undefined,
      OrderID: Number.parseInt(res.OrderID),
      TransactionID: Number.parseInt(res.TransactionID),
      WhoisguardEnable: res.WhoisguardEnable === "true",
      NonRealTimeDomain: res.NonRealTimeDomain === "true",
    };
  };

  public createDomain = async (
    params: DomainsCreateUserParams
  ): Promise<DomainsCreateCleanedResponse> =>
    this._makeRequest(
      "namecheap.domains.create",
      this._parseDomainsCreateParams(params),
      this._parseDomainsCreateResponse,
      "GET"
    );

  // --- Method: namecheap.domains.renew ---
  private _parseDomainsRenewParams = (params: DomainsRenewUserParams): NamecheapRequestParams => ({
    DomainName: params.DomainName,
    Years: String(params.Years),
  });

  private _parseDomainsRenewResponse = async (raw: RawDomainsRenewCommandResponseContent): Promise<DomainsRenewCleanedResponse> => {
    const r = raw.DomainRenewResult?.[0]?.$;
    if (!r) throw new Error("DomainRenewResult ausente.");
    const chargedAmountBRL = await this._convertPrice(parseFloat(r.ChargedAmount), "USD");
    return {
      Domain: r.Domain,
      Renewed: r.Renewed === "true",
      ChargedAmount: chargedAmountBRL,
      OrderId: parseInt(r.OrderID),
      TransactionId: parseInt(r.TransactionID),
      ExpireDate: r.ExpireDate,
    };
  };

  public renewDomain = async (params: DomainsRenewUserParams): Promise<DomainsRenewCleanedResponse> =>
    this._makeRequest("namecheap.domains.renew", this._parseDomainsRenewParams(params), this._parseDomainsRenewResponse, "GET");

  // --- Method 7: namecheap.domains.getInfo ---
  private _parseDomainsGetInfoParams = (
    params: DomainsGetInfoUserParams
  ): NamecheapRequestParams => {
    const apiParams: NamecheapRequestParams = { DomainName: params.DomainName };
    if (params.HostName) apiParams.HostName = params.HostName;
    return apiParams;
  };

  private _parseDomainsGetInfoResponse = (
    rawContent: RawDomainsGetInfoCommandResponseContent
  ): DomainsGetInfoCleanedResponse => {
    const resultNode = rawContent.DomainGetInfoResult?.[0];
    if (!resultNode || !resultNode.$)
      throw new Error("DomainGetInfoResult missing/malformed.");

    const resultAttrs = resultNode.$;
    const domainDetailsRaw = resultNode.DomainDetails?.[0];
    const dnsDetailsRaw = resultNode.DnsDetails?.[0];
    const whoisguardRaw = resultNode.Whoisguard?.[0];

    const dnsDetails: NamecheapDnsDetails = {
      ProviderType: dnsDetailsRaw?.ProviderType || "UNKNOWN",
      IsUsingOurDNS: dnsDetailsRaw?.IsUsingOurDNS === "true",
      HostCount: dnsDetailsRaw?.HostCount
        ? Number.parseInt(dnsDetailsRaw.HostCount)
        : 0,
      EmailType: dnsDetailsRaw?.EmailType || "UNKNOWN",
      DynamicDNSStatus: dnsDetailsRaw?.DynamicDNSStatus === "true",
      IsFailover: dnsDetailsRaw?.IsFailover === "true",
      Nameservers: dnsDetailsRaw?.Nameserver || [],
    };

    const whoisguard: NamecheapWhoisguardInfo = {
      Enabled: whoisguardRaw?.Enabled === "true",
      ID: whoisguardRaw?.ID,
      EmailDetails: whoisguardRaw?.EmailDetails?.$
        ? {
          ForwardedTo: whoisguardRaw.EmailDetails.$.ForwardedTo,
          LastAutoRenew: whoisguardRaw.EmailDetails.$.LastAutoRenew,
          AutoRenew: whoisguardRaw.EmailDetails.$.AutoRenew === "true",
        }
        : undefined,
    };

    let autoRenewStatus = false;
    if (
      whoisguard.Enabled &&
      whoisguard.EmailDetails?.AutoRenew !== undefined
    ) {
      autoRenewStatus = whoisguard.EmailDetails.AutoRenew;
    }

    return {
      DomainName: resultAttrs.DomainName,
      OwnerName: resultAttrs.OwnerName,
      ID: Number.parseInt(resultAttrs.ID),
      IsOwner: resultAttrs.IsOwner === "true",
      IsPremium: resultAttrs.IsPremium === "true",
      Status: resultAttrs.Status,
      IsLocked:
        resultAttrs.Status.toUpperCase() === "CLIENTHOLD" ||
        resultAttrs.Status.toUpperCase() === "LOCKED" ||
        resultAttrs.Status.toUpperCase() === "REGISTRAR-LOCK",
      IsOurDNS: dnsDetails.IsUsingOurDNS,
      CreatedDate: domainDetailsRaw?.CreatedDate[0] || "N/A",
      ExpireDate: domainDetailsRaw?.ExpiredDate[0] || "N/A",
      AutoRenew: autoRenewStatus,
      Whoisguard: whoisguard,
      DnsDetails: dnsDetails,
      Modificationrights: resultNode.Modificationrights?.[0]?.$
        ? {
          All: resultNode.Modificationrights[0].$.All === "true",
          ChangeDNS: resultNode.Modificationrights[0].$.ChangeDNS === "true",
        }
        : undefined,
    };
  };

  public getInfo = async (
    params: DomainsGetInfoUserParams
  ): Promise<DomainsGetInfoCleanedResponse> =>
    this._makeRequest(
      "namecheap.domains.getinfo",
      this._parseDomainsGetInfoParams(params),
      this._parseDomainsGetInfoResponse,
      "GET"
    );

  // --- Method 8: namecheap.users.create ---
  private _parseUsersCreateParams = (
    params: UsersCreateUserParams
  ): NamecheapRequestParams => {
    const apiParams: NamecheapRequestParams = {
      NewUserName: params.NewUserName,
      NewUserPassword: params.NewUserPassword,
      EmailAddress: params.EmailAddress,
      FirstName: params.FirstName,
      LastName: params.LastName,
      AcceptTerms: params.AcceptTerms ? "1" : "0",
      Address1: params.Address1,
      City: params.City,
      StateProvince: params.StateProvince,
      Zip: params.Zip,
      Country: params.Country,
      Phone: params.Phone,
    };

    if (params.AcceptNews !== undefined)
      apiParams.AcceptNews = params.AcceptNews ? "1" : "0";
    if (params.JobTitle) apiParams.JobTitle = params.JobTitle;
    if (params.Organization) apiParams.Organization = params.Organization;
    if (params.Address2) apiParams.Address2 = params.Address2;
    if (params.Fax) apiParams.Fax = params.Fax;

    return apiParams;
  };

  private _parseUsersCreateResponse = (
    rawContent: RawUsersCreateCommandResponseContent
  ): UsersCreateCleanedResponse => {
    const resultNode = rawContent.UserCreateResult;
    if (!resultNode || !resultNode.$)
      throw new Error("UserCreateResult is missing in the API response.");
    const result = resultNode.$;
    return {
      Success: result.Success === "true",
      UserId: result.UserId ? Number.parseInt(result.UserId, 10) : undefined,
    };
  };

  public createUser = async (
    params: UsersCreateUserParams
  ): Promise<UsersCreateCleanedResponse> =>
    this._makeRequest(
      "namecheap.users.create",
      this._parseUsersCreateParams(params),
      this._parseUsersCreateResponse,
      "POST"
    );

  private _parseDomainsNsCreateParams = (
    params: DomainsNsCreateUserParams
  ): NamecheapRequestParams => {
    return {
      SLD: params.SLD,
      TLD: params.TLD,
      Nameserver: params.Nameserver,
      IP: params.IP,
    };
  };

  private _parseDomainsNsCreateResponse = (
    rawContent: RawDomainsNsCreateCommandResponseContent
  ): DomainsNsCreateCleanedResponse => {
    const resultAttrs = rawContent.DomainNSCreateResult?.[0]?.$;
    if (!resultAttrs) {
      throw new Error(
        "DomainNSCreateResult is missing or malformed in the API response."
      );
    }
    return {
      Domain: resultAttrs.Domain,
      Nameserver: resultAttrs.Nameserver,
      IP: resultAttrs.IP,
      IsSuccess: resultAttrs.IsSuccess === "true",
    };
  };

  public createNameserver = async (
    params: DomainsNsCreateUserParams
  ): Promise<DomainsNsCreateCleanedResponse> => {
    const command = "namecheap.domains.ns.create";
    const apiParams = this._parseDomainsNsCreateParams(params);
    // Modification commands are often POST, even if example URL is GET
    return this._makeRequest<
      RawDomainsNsCreateCommandResponseContent,
      DomainsNsCreateCleanedResponse
    >(command, apiParams, this._parseDomainsNsCreateResponse, "POST");
  };

  private _parseDomainsDnsGetHostsParams = (
    params: DomainsDnsGetHostsUserParams
  ): NamecheapRequestParams => {
    return {
      SLD: params.SLD,
      TLD: params.TLD,
    };
  };

  private _parseDomainsDnsGetHostsResponse = (
    rawContent: RawDomainsDnsGetHostsCommandResponseContent
  ): DomainsDnsGetHostsCleanedResponse => {
    const resultNode = rawContent.DomainDNSGetHostsResult?.[0];
    if (!resultNode || !resultNode.$) {
      throw new Error(
        "DomainDNSGetHostsResult is missing or malformed in the API response."
      );
    }

    const resultAttrs = resultNode.$;
    const hosts: DnsHostRecordItem[] = [];

    if (resultNode.host) {
      for (const rawHost of resultNode.host) {
        const hostAttrs = rawHost.$;
        hosts.push({
          HostId: Number.parseInt(hostAttrs.HostId, 10),
          Name: hostAttrs.Name,
          Type: hostAttrs.Type,
          Address: hostAttrs.Address,
          MXPref: hostAttrs.MXPref
            ? Number.parseInt(hostAttrs.MXPref, 10)
            : undefined, // MXPref is present even for A records with value "10" in example, handle appropriately
          TTL: Number.parseInt(hostAttrs.TTL, 10),
        });
      }
    }

    return {
      Domain: resultAttrs.Domain,
      IsUsingOurDNS: resultAttrs.IsUsingOurDNS === "true",
      Hosts: hosts,
    };
  };

  /**
   * Retrieves DNS host record settings for the requested domain.
   */
  public getDnsHosts = async (
    params: DomainsDnsGetHostsUserParams
  ): Promise<DomainsDnsGetHostsCleanedResponse> => {
    const command = "namecheap.domains.dns.getHosts";
    const apiParams = this._parseDomainsDnsGetHostsParams(params);
    // This is a GET request according to the example
    return this._makeRequest<
      RawDomainsDnsGetHostsCommandResponseContent,
      DomainsDnsGetHostsCleanedResponse
    >(command, apiParams, this._parseDomainsDnsGetHostsResponse, "GET");
  };
}

export const namecheapApi = new NamecheapApiWrapper(
  process.env.NAMECHEAP_API_USER as string
);

export async function getDomainPricing(tld: string) {
  const response = await namecheapApi.getPricing(tld);
  const categories = response?.ProductType?.Categories || [];
  const registerCategory = categories.find(c => c.Name.toUpperCase() === "REGISTER");
  if (registerCategory) {
    return registerCategory.Products.find(p => p.Name.toLowerCase() === tld.toLowerCase())
      ?? registerCategory.Products[0]
      ?? null;
  }
  return categories.flatMap(c => c.Products)[0] ?? null;
}

export default namecheapApi;
