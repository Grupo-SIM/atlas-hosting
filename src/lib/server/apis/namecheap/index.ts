// lib/server/apis/namecheap/index.ts
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { parseStringPromise } from "xml2js";
import type {
  DomainCheckResultItem,
  DomainsCheckCleanedResponse,
  DomainsCheckUserParams,
  DomainsCreateCleanedResponse,
  DomainsCreateUserParams,
  DomainsGetInfoCleanedResponse,
  DomainsGetInfoUserParams,
  // START: Added for namecheap.domains.getList
  DomainsGetListCleanedResponse,
  DomainsGetListUserParams,
  RawDomainsGetListCommandResponseContent,
  // END: Added for namecheap.domains.getList
  DomainsGetTldListCleanedResponse,
  NamecheapContactDetails,
  NamecheapDnsDetails,
  NamecheapRequestParams,
  NamecheapWhoisguardInfo,
  ProductCategoryPricingInfo,
  ProductPriceDetail,
  ProductPricingInfo,
  RawDomainsCheckCommandResponseContent,
  RawDomainsCreateCommandResponseContent,
  RawDomainsGetInfoCommandResponseContent,
  RawDomainsGetTldListCommandResponseContent,
  RawNamecheapApiResponse,
  RawUsersCreateCommandResponseContent,
  RawUsersGetPricingCommandResponseContent,
  TldListItem,
  UsersCreateCleanedResponse,
  UsersCreateUserParams,
  UsersGetPricingCleanedResponse,
  UsersGetPricingUserParams,
  DomainListItem,
  PagingInfo,
} from "./types";
import { isString } from "lodash";

const TARGET_CURRENCY = "BRL";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export class NamecheapApiWrapper {
  private axiosInstance: AxiosInstance;
  private readonly apiUser = process.env.NAMECHEAP_API_USER!;
  private readonly apiKey = process.env.NAMECHEAP_API_KEY!;
  private readonly userName: string;
  private readonly clientIp = process.env.PUBLIC_IP!;
  private readonly baseUrl = "https://api.namecheap.com/xml.response";

  private db = db;
  private domainPricingCacheTable = schema.domainPricingCache;

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

  private dbDomainPricesLastRefreshed: number = 0; // In-memory track of last DB refresh
  private dbDomainPricingRefreshInterval: NodeJS.Timeout | null = null;
  private isDbDomainPricingRefreshing: boolean = false;
  private dbRefreshPromise: Promise<void> | null = null;

  constructor(userName: string) {
    this.userName = userName;
    this.axiosInstance = axios.create();

    this._initializeTldApiCacheAndInterval();
    this._initializeDbDomainPricingCacheAndInterval();
  }

  private async _initializeTldApiCacheAndInterval(): Promise<void> {
    console.log(
      "NamecheapApiWrapper: Initializing TLD List API (in-memory) cache..."
    );
    await this._fetchAndCacheTldListApi(); // Fetches TLD metadata
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
        from: fromCurrency.toLowerCase() as any,
        to: TARGET_CURRENCY.toLowerCase() as any,
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
          this._parseUsersGetPricingResponse, // This converts to BRL for in-memory
          "GET"
        );
        if (freshPricing?.ProductType) {
          this.domainPricingApiCache.value = freshPricing;
          this.domainPricingApiCache.lastUpdated = Date.now();
          // Trigger non-blocking DB update (should fetch USD again or use raw before conversion)
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
          // Fetch raw USD data
          RawUsersGetPricingCommandResponseContent,
          RawUsersGetPricingCommandResponseContent // Keep it raw
        >(
          "namecheap.users.getPricing",
          this._parseUsersGetPricingParams(rawPricingParams),
          (rawContent) => rawContent, // Pass through raw content (USD)
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
        tldListMetaData?.Tlds.forEach((tld) => {
          tldMetaDataMap.set(tld.Name.toLowerCase(), {
            minReg: tld.MinRegisterYears,
            maxReg: tld.MaxRegisterYears,
          });
        });

        const upsertData: (typeof schema.domainPricingCache.$inferInsert)[] =
          [];

        productTypeNode.ProductCategory.forEach((category) => {
          const actionType = category.$.Name.toUpperCase();
          category.Product?.forEach((product) => {
            const tld = product.$.Name.toLowerCase();
            const oneYearPriceDetail = product.Price?.find(
              (p) => p.$.Duration === "1" && p.$.DurationType === "YEAR"
            );

            if (
              oneYearPriceDetail &&
              oneYearPriceDetail.$.Currency.toUpperCase() === "USD"
            ) {
              const currentEntry = upsertData.find((item) => item.tld === tld);
              const priceUSD = parseFloat(oneYearPriceDetail.$.Price);
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
          });
        });

        if (upsertData.length > 0) {
          console.log(
            `NCW: Upserting ${upsertData.length} TLD prices (USD) to DB cache...`
          );
          for (const data of upsertData) {
            const valuesToUpsert: typeof schema.domainPricingCache.$inferInsert =
              {
                tld: data.tld!,
                price: data.price ?? null,
                renew: data.renew ?? null,
                transfer: data.transfer ?? null,
                minRegisterYears: data.minRegisterYears ?? null,
                maxRegisterYears: data.maxRegisterYears ?? null,
                createdAt: data.createdAt!,
                updatedAt: data.updatedAt!,
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
          headers: { Accept: "application/xml" },
        });
      }
      const parsedXml: RawNamecheapApiResponse<TCommandResponseContent> =
        await parseStringPromise(response.data, { explicitArray: true });
      if (!parsedXml.ApiResponse)
        throw new Error("Invalid API response: ApiResponse root missing.");
      if (parsedXml.ApiResponse.$.Status === "ERROR") {
        let errMsg = `NC API Error for ${command}.`;
        const errNode = parsedXml.ApiResponse.Errors?.[0];
        if (typeof errNode === "object" && errNode.Error)
          errMsg += errNode.Error.map((e) => ` Err ${e.$.Number}: ${e._}`).join(
            "; "
          );
        else if (typeof errNode === "string" && errNode.trim())
          errMsg += ` Details: ${errNode}`;
        else if (parsedXml.ApiResponse.Errors)
          errMsg += ` Raw Errors: ${JSON.stringify(parsedXml.ApiResponse.Errors)}`;
        // Check for specific error 5050169
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

  // --- Method 1: namecheap.domains.check (Parser is async, converts to BRL) ---
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
            parseFloat(attrs.PremiumRegistrationPrice),
            originalCurrency
          ),
          PremiumRenewalPrice: await this._convertPrice(
            parseFloat(attrs.PremiumRenewalPrice),
            originalCurrency
          ),
          PremiumRestorePrice: await this._convertPrice(
            parseFloat(attrs.PremiumRestorePrice),
            originalCurrency
          ),
          PremiumTransferPrice: await this._convertPrice(
            parseFloat(attrs.PremiumTransferPrice),
            originalCurrency
          ),
          IcannFee: await this._convertPrice(
            parseFloat(attrs.IcannFee),
            originalCurrency
          ),
          EapFee: await this._convertPrice(
            parseFloat(attrs.EapFee),
            originalCurrency
          ),
        });
      }
    }
    return { Results: results };
  };

  public check = async (
    params: DomainsCheckUserParams
  ): Promise<DomainsCheckCleanedResponse> =>
    this._makeRequest(
      "namecheap.domains.check",
      this._parseDomainsCheckParams(params),
      this._parseDomainsCheckResponse,
      "GET"
    );

  // --- START: Added for namecheap.domains.getList ---
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
      rawDomainList.forEach((d) => {
        const attrs = d.$;
        domains.push({
          ID: parseInt(attrs.ID),
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
      });
    }

    const rawPaging = rawContent.Paging?.[0];
    const paging: PagingInfo = {
      TotalItems: rawPaging?.TotalItems?.[0]
        ? parseInt(rawPaging.TotalItems[0])
        : 0,
      CurrentPage: rawPaging?.CurrentPage?.[0]
        ? parseInt(rawPaging.CurrentPage[0])
        : 1,
      PageSize: rawPaging?.PageSize?.[0] ? parseInt(rawPaging.PageSize[0]) : 0,
    };

    return { Domains: domains, Paging: paging };
  };

  public getList = async (
    params: DomainsGetListUserParams
  ): Promise<DomainsGetListCleanedResponse> =>
    this._makeRequest<
      RawDomainsGetListCommandResponseContent,
      DomainsGetListCleanedResponse
    >(
      "namecheap.domains.getList",
      this._parseDomainsGetListParams(params),
      this._parseDomainsGetListResponse,
      "GET" // As per documentation, it's a GET request
    );
  // --- END: Added for namecheap.domains.getList ---

  // --- Method 4: namecheap.domains.getTldList (Uses in-memory API cache) ---
  private _parseDomainsGetTldListResponse = (
    rawContent: RawDomainsGetTldListCommandResponseContent
  ): DomainsGetTldListCleanedResponse => {
    const tlds: TldListItem[] = [];
    const rawTldArray = rawContent.Tlds?.[0]?.Tld;
    if (rawTldArray) {
      rawTldArray.forEach((rt) => {
        const attrs = rt.$;
        const desc = rt._ || ""; // Description is the text node content
        tlds.push({
          Name: attrs.Name,
          Description: desc.trim(),
          NonRealTime: attrs.NonRealTime === "true",
          MinRegisterYears: parseInt(attrs.MinRegisterYears),
          MaxRegisterYears: parseInt(attrs.MaxRegisterYears),
          MinRenewYears: parseInt(attrs.MinRenewYears),
          MaxRenewYears: parseInt(attrs.MaxRenewYears),
          MinTransferYears: parseInt(attrs.MinTransferYears),
          MaxTransferYears: parseInt(attrs.MaxTransferYears),
          IsApiRegisterable: attrs.IsApiRegisterable === "true",
          IsApiRenewable: attrs.IsApiRenewable === "true",
          IsApiTransferable: attrs.IsApiTransferable === "true",
          IsEppRequired: attrs.IsEppRequired === "true",
          IsDisableModContact: attrs.IsDisableModContact === "true",
          IsDisableWGAllot: attrs.IsDisableWGAllot === "true",
          IsIncludeInExtendedSearchOnly:
            attrs.IsIncludeInExtendedSearchOnly === "true",
          SequenceNumber: parseInt(attrs.SequenceNumber),
          Type: attrs.Type,
          IsSupportsIDN: attrs.IsSupportsIDN === "true",
          Category: attrs.Category,
          IsDisableModifications: attrs.IsDisableModifications === "true",
          SupportsRegistrarLock: attrs.SupportsRegistrarLock === "true",
          AddGracePeriodDays: attrs.AddGracePeriodDays
            ? parseInt(attrs.AddGracePeriodDays)
            : 0,
          WhoisVerification: attrs.WhoisVerification === "true",
          ProviderApiDelete: attrs.ProviderApiDelete === "true",
        });
      });
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

  // --- Method 5: namecheap.users.getPricing (Uses in-memory API cache for full BRL converted response, triggers DB USD cache update) ---
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
                const originalCurrency = pAttrs.Currency.toUpperCase(); // Preserve original currency
                prices.push({
                  Duration: parseInt(pAttrs.Duration),
                  DurationType: pAttrs.DurationType,
                  Price: await this._convertPrice(
                    parseFloat(pAttrs.Price),
                    originalCurrency
                  ),
                  RegularPrice: await this._convertPrice(
                    parseFloat(pAttrs.RegularPrice),
                    originalCurrency
                  ),
                  YourPrice: await this._convertPrice(
                    parseFloat(pAttrs.YourPrice),
                    originalCurrency
                  ),
                  CouponPrice: pAttrs.CouponPrice
                    ? await this._convertPrice(
                        parseFloat(pAttrs.CouponPrice),
                        originalCurrency
                      )
                    : 0,
                  Currency: TARGET_CURRENCY as "BRL", // Set to target currency after conversion
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

  public getPricing = async (
    params: UsersGetPricingUserParams
  ): Promise<UsersGetPricingCleanedResponse | null> => {
    const isGeneralDomainPricingRequest =
      params.ProductType === "DOMAIN" &&
      !params.ProductCategory &&
      !params.ProductName &&
      !params.ActionName &&
      !params.PromotionCode;

    if (isGeneralDomainPricingRequest) {
      const now = Date.now();
      const isCacheStale =
        !this.domainPricingApiCache.value ||
        now - this.domainPricingApiCache.lastUpdated > CACHE_DURATION_MS;

      if (isCacheStale) {
        if (
          this.domainPricingApiCache.isFetching &&
          this.domainPricingApiCache.fetchPromise
        ) {
          return this.domainPricingApiCache.fetchPromise;
        }
        return this._fetchAndCacheFullDomainPricing(); // This fetches and caches BRL prices
      }
      return this.domainPricingApiCache.value; // Return BRL prices from cache
    }

    // For specific pricing requests, fetch directly (will also convert to BRL)
    const apiParams = this._parseUsersGetPricingParams(params);
    return this._makeRequest<
      RawUsersGetPricingCommandResponseContent,
      UsersGetPricingCleanedResponse
    >(
      "namecheap.users.getPricing",
      apiParams,
      this._parseUsersGetPricingResponse, // Converts to BRL
      "GET"
    );
  };

  // --- Method 6: namecheap.domains.create (Parser is async, converts ChargedAmount to BRL) ---
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
    return apiParams;
  };

  private _parseDomainsCreateResponse = async (
    rawContent: RawDomainsCreateCommandResponseContent
  ): Promise<DomainsCreateCleanedResponse> => {
    const resNode = rawContent.DomainCreateResult; // This should be an object
    if (!resNode || !resNode.$)
      throw new Error("DomainCreateResult missing or malformed.");
    const res = resNode.$;
    const originalCurrency = "USD"; // Assume ChargedAmount is in USD
    const chargedAmountBRL = await this._convertPrice(
      parseFloat(res.ChargedAmount),
      originalCurrency
    );
    return {
      Domain: res.Domain,
      Registered: res.Registered === "true",
      ChargedAmount: chargedAmountBRL,
      DomainID: res.DomainID ? parseInt(res.DomainID) : undefined,
      OrderID: parseInt(res.OrderID),
      TransactionID: parseInt(res.TransactionID),
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
      "POST"
    );

  // --- Method 7: namecheap.domains.getInfo (No prices to convert here) ---
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
    const resultNode = rawContent.DomainGetInfoResult; // This should be an object
    if (!resultNode || !resultNode.$)
      throw new Error("DomainGetInfoResult missing/malformed.");

    const resultAttrs = resultNode.$;
    const domainDetailsRaw = resultNode.DomainDetails?.[0]; // xml2js default array
    const dnsDetailsRaw = resultNode.DnsDetails?.[0]; // xml2js default array
    const whoisguardRaw = resultNode.Whoisguard?.[0]; // xml2js default array

    const dnsDetails: NamecheapDnsDetails = {
      ProviderType: dnsDetailsRaw?.ProviderType || "UNKNOWN",
      IsUsingOurDNS: dnsDetailsRaw?.IsUsingOurDNS === "true",
      HostCount: dnsDetailsRaw?.HostCount
        ? parseInt(dnsDetailsRaw.HostCount)
        : 0,
      EmailType: dnsDetailsRaw?.EmailType || "UNKNOWN",
      DynamicDNSStatus: dnsDetailsRaw?.DynamicDNSStatus === "true",
      IsFailover: dnsDetailsRaw?.IsFailover === "true",
      Nameservers: dnsDetailsRaw?.Nameserver || [], // Nameserver can be multiple
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
    // Logic for AutoRenew: if domain uses WhoisGuard and WG is set to autorenew, then domain is AutoRenew=true
    // Otherwise, need to check domain's specific AutoRenew flag (which is not directly in getInfo for domain itself, but part of Whoisguard section or separate calls)
    // For now, relying on Whoisguard auto-renew status if enabled.
    // This might need refinement if Namecheap has a separate AutoRenew flag for the domain itself distinct from Whoisguard's.
    // The provided getList response has a direct AutoRenew for the domain. getInfo seems to only show it for Whoisguard.
    // For consistency with getList, we'll assume the Whoisguard's autorenew implies domain autorenew if WG is active.
    if (
      whoisguard.Enabled &&
      whoisguard.EmailDetails?.AutoRenew !== undefined
    ) {
      autoRenewStatus = whoisguard.EmailDetails.AutoRenew;
    }
    // If a more direct domain AutoRenew flag becomes available in getInfo, use that.

    return {
      DomainName: resultAttrs.DomainName,
      OwnerName: resultAttrs.OwnerName,
      ID: parseInt(resultAttrs.ID),
      IsOwner: resultAttrs.IsOwner === "true",
      IsPremium: resultAttrs.IsPremium === "true",
      Status: resultAttrs.Status,
      IsLocked:
        resultAttrs.Status.toUpperCase() === "CLIENTHOLD" ||
        resultAttrs.Status.toUpperCase() === "LOCKED" ||
        resultAttrs.Status.toUpperCase() === "REGISTRAR-LOCK",
      IsOurDNS: dnsDetails.IsUsingOurDNS,
      CreatedDate: domainDetailsRaw?.CreatedDate || "N/A",
      ExpireDate: domainDetailsRaw?.ExpiredDate || "N/A",
      AutoRenew: autoRenewStatus, // Derived from Whoisguard currently
      Whoisguard: whoisguard,
      DnsDetails: dnsDetails,
      Modificationrights: resultNode.Modificationrights?.[0]?.$
        ? {
            // xml2js default array
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

  // --- Method 8: namecheap.users.create (Parser is synchronous as no prices) ---
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
    const resultNode = rawContent.UserCreateResult; // This should be an object
    if (!resultNode || !resultNode.$)
      throw new Error("UserCreateResult is missing in the API response.");
    const result = resultNode.$;
    return {
      Success: result.Success === "true",
      UserId: result.UserId ? parseInt(result.UserId, 10) : undefined,
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
}

// Placeholder for original export style, adjust as per your singleton setup:
export const namecheapApi = new NamecheapApiWrapper(
  process.env.NAMECHEAP_API_USER!
);

export default namecheapApi; // Keep if this is how you export the singleton
