import axios, { AxiosInstance, AxiosResponse } from "axios";
import { parseStringPromise } from "xml2js";
import currencyConversion from "@/lib/server/apis/currency";
import type {
  NamecheapRequestParams,
  RawNamecheapApiResponse,
  // ... (all existing type imports from previous steps)
  DomainsGetTldListCleanedResponse,
  RawDomainsGetTldListCommandResponseContent,
  TldListItem,
  RawTldAttributes,
  DomainsCheckUserParams,
  DomainsCheckCleanedResponse,
  RawDomainsCheckCommandResponseContent,
  DomainCheckResultItem,
  DomainsGetListUserParams,
  DomainsGetListCleanedResponse,
  RawDomainsGetListCommandResponseContent,
  DomainListItem,
  PagingInfo,
  DomainsDnsSetHostsUserParams,
  DomainsDnsSetHostsCleanedResponse,
  RawDomainsDnsSetHostsCommandResponseContent,
  UsersGetPricingUserParams,
  UsersGetPricingCleanedResponse,
  RawUsersGetPricingCommandResponseContent,
  ProductTypePricingInfo,
  ProductCategoryPricingInfo,
  ProductPricingInfo,
  ProductPriceDetail,
  RawProductTypeContent,
  RawProductCategoryContent,
  RawProductContent,
  RawPriceAttributes,
  DomainsCreateUserParams,
  NamecheapContactDetails,
  DomainsCreateCleanedResponse,
  RawDomainsCreateCommandResponseContent,
  DomainsGetInfoUserParams,
  DomainsGetInfoCleanedResponse,
  RawDomainsGetInfoCommandResponseContent,
  NamecheapDnsDetails,
  NamecheapWhoisguardInfo,
  RawDomainDetails,
  RawDnsDetails,
  RawWhoisguard,
  RawModificationrights,

  // New types for users.create
  UsersCreateUserParams,
  UsersCreateCleanedResponse,
  RawUsersCreateCommandResponseContent,
  RawUserCreateResultAttributes, // Though used internally
} from "./types";

const TARGET_CURRENCY = "BRL";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export class NamecheapApiWrapper {
  private axiosInstance: AxiosInstance;
  private readonly apiUser: string;
  private readonly apiKey: string;
  private readonly userName: string;
  private readonly clientIp: string;
  private readonly baseUrl: string = "https://api.namecheap.com/xml.response";

  // TLD List Cache
  private tldListCache: {
    value: DomainsGetTldListCleanedResponse | null;
    lastUpdated: number;
    isFetching: boolean;
    fetchPromise: Promise<DomainsGetTldListCleanedResponse | null> | null;
  } = { value: null, lastUpdated: 0, isFetching: false, fetchPromise: null };

  private tldListRefreshInterval: NodeJS.Timeout | null = null;

  // Domain Pricing Cache
  private domainPricingCache: {
    value: UsersGetPricingCleanedResponse | null;
    lastUpdated: number;
    isFetching: boolean;
    fetchPromise: Promise<UsersGetPricingCleanedResponse | null> | null;
  } = { value: null, lastUpdated: 0, isFetching: false, fetchPromise: null };

  private domainPricingRefreshInterval: NodeJS.Timeout | null = null;

  constructor(
    apiUser: string,
    apiKey: string,
    userName: string,
    clientIp: string
  ) {
    this.apiUser = apiUser;
    this.apiKey = apiKey;
    this.userName = userName;
    this.clientIp = clientIp;
    this.axiosInstance = axios.create();

    this._initializeTldCacheAndInterval();
    this._initializeDomainPricingCacheAndInterval();
  }

  private async _initializeTldCacheAndInterval(): Promise<void> {
    console.log("NamecheapApiWrapper: Initializing TLD list cache...");
    await this._fetchAndCacheTldList();
    if (this.tldListRefreshInterval) clearInterval(this.tldListRefreshInterval);
    this.tldListRefreshInterval = setInterval(async () => {
      console.log(
        "NamecheapApiWrapper: Refreshing TLD list cache due to interval."
      );
      await this._fetchAndCacheTldList();
    }, CACHE_DURATION_MS);
  }

  private async _initializeDomainPricingCacheAndInterval(): Promise<void> {
    console.log("NamecheapApiWrapper: Initializing Domain Pricing cache...");
    await this._fetchAndCacheDomainPricing();
    if (this.domainPricingRefreshInterval)
      clearInterval(this.domainPricingRefreshInterval);
    this.domainPricingRefreshInterval = setInterval(async () => {
      console.log(
        "NamecheapApiWrapper: Refreshing Domain Pricing cache due to interval."
      );
      await this._fetchAndCacheDomainPricing();
    }, CACHE_DURATION_MS);
  }

  private async _convertPrice(
    amount: number,
    fromCurrency: string
  ): Promise<number> {
    if (fromCurrency.toUpperCase() === TARGET_CURRENCY || amount === 0) {
      return amount;
    }
    try {
      return await currencyConversion.convert({
        from: fromCurrency.toLowerCase() as any,
        to: TARGET_CURRENCY.toLowerCase() as any,
        amount: amount,
      });
    } catch (error) {
      console.error(
        `Currency conversion failed for ${amount} ${fromCurrency} to ${TARGET_CURRENCY}:`,
        error
      );
      return amount;
    }
  }

  private async _fetchAndCacheTldList(): Promise<DomainsGetTldListCleanedResponse | null> {
    if (this.tldListCache.isFetching && this.tldListCache.fetchPromise)
      return this.tldListCache.fetchPromise;
    this.tldListCache.isFetching = true;
    console.log("NamecheapApiWrapper: Fetching new TLD list from API...");
    this.tldListCache.fetchPromise = (async () => {
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
          this.tldListCache.value = freshTldList;
          this.tldListCache.lastUpdated = Date.now();
          console.log(
            `NamecheapApiWrapper: TLD list cache updated with ${freshTldList.Tlds.length} TLDs.`
          );
          return freshTldList;
        }
        return this.tldListCache.value;
      } catch (error) {
        console.error("NCW: Error TLD fetch:", error);
        return this.tldListCache.value;
      } finally {
        this.tldListCache.isFetching = false;
        this.tldListCache.fetchPromise = null;
      }
    })();
    return this.tldListCache.fetchPromise;
  }

  private async _fetchAndCacheDomainPricing(): Promise<UsersGetPricingCleanedResponse | null> {
    if (
      this.domainPricingCache.isFetching &&
      this.domainPricingCache.fetchPromise
    )
      return this.domainPricingCache.fetchPromise;
    this.domainPricingCache.isFetching = true;
    console.log("NamecheapApiWrapper: Fetching new Domain Pricing from API...");
    this.domainPricingCache.fetchPromise = (async () => {
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
          this.domainPricingCache.value = freshPricing;
          this.domainPricingCache.lastUpdated = Date.now();
          console.log(`NamecheapApiWrapper: Domain Pricing cache updated.`);
          return freshPricing;
        }
        return this.domainPricingCache.value;
      } catch (error) {
        console.error("NCW: Error Domain Pricing fetch:", error);
        return this.domainPricingCache.value;
      } finally {
        this.domainPricingCache.isFetching = false;
        this.domainPricingCache.fetchPromise = null;
      }
    })();
    return this.domainPricingCache.fetchPromise;
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

  // --- Existing Methods (check, getList, setHosts, getTldList, getPricing, createDomain, getInfo) ---
  // ... (These methods and their parsers remain as previously defined and corrected) ...
  // (For brevity, I'm omitting the full code of already implemented methods here,
  //  but they should be present in your actual class file.)

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

  private _parseDomainsGetListParams = (
    params: DomainsGetListUserParams
  ): NamecheapRequestParams => {
    const p: NamecheapRequestParams = {};
    if (params.ListType) p.ListType = params.ListType;
    if (params.SearchTerm) p.SearchTerm = params.SearchTerm;
    if (params.Page) p.Page = params.Page;
    if (params.PageSize) p.PageSize = params.PageSize;
    if (params.SortBy) p.SortBy = params.SortBy;
    return p;
  };

  private _parseDomainsGetListResponse = (
    rawContent: RawDomainsGetListCommandResponseContent
  ): DomainsGetListCleanedResponse => {
    const domains: DomainListItem[] = [];
    const paging: PagingInfo = { TotalItems: 0, CurrentPage: 1, PageSize: 0 };
    const rawResult = rawContent.DomainGetListResult?.[0];
    if (rawResult?.Domain) {
      rawResult.Domain.forEach((d) =>
        domains.push({
          ID: parseInt(d.$.ID),
          Name: d.$.Name,
          User: d.$.User,
          Created: d.$.Created,
          Expires: d.$.Expires,
          IsExpired: d.$.IsExpired === "true",
          IsLocked: d.$.IsLocked === "true",
          AutoRenew: d.$.AutoRenew === "true",
          WhoisGuard: d.$.WhoisGuard,
          IsPremium: d.$.IsPremium === "true",
          IsOurDNS: d.$.IsOurDNS === "true",
        })
      );
    }
    const rawPaging = rawContent.Paging?.[0];
    if (rawPaging) {
      paging.TotalItems = rawPaging.TotalItems?.[0]
        ? parseInt(rawPaging.TotalItems[0])
        : 0;
      paging.CurrentPage = rawPaging.CurrentPage?.[0]
        ? parseInt(rawPaging.CurrentPage[0])
        : 1;
      paging.PageSize = rawPaging.PageSize?.[0]
        ? parseInt(rawPaging.PageSize[0])
        : 0;
    }
    return { Domains: domains, Paging: paging };
  };

  public getList = async (
    params: DomainsGetListUserParams = {}
  ): Promise<DomainsGetListCleanedResponse> =>
    this._makeRequest(
      "namecheap.domains.getList",
      this._parseDomainsGetListParams(params),
      this._parseDomainsGetListResponse,
      "GET"
    );

  private _parseDomainsDnsSetHostsParams = (
    params: DomainsDnsSetHostsUserParams
  ): NamecheapRequestParams => {
    const p: NamecheapRequestParams = { SLD: params.SLD, TLD: params.TLD };
    params.Records.forEach((r, i) => {
      const idx = i + 1;
      p[`HostName${idx}`] = r.HostName;
      p[`RecordType${idx}`] = r.RecordType;
      p[`Address${idx}`] = r.Address;
      if (r.MXPref !== undefined) p[`MXPref${idx}`] = r.MXPref;
      if (r.TTL !== undefined) p[`TTL${idx}`] = r.TTL;
      if (r.RecordType === "CAA") {
        if (r.Flag !== undefined) p[`Flag${idx}`] = r.Flag;
        if (r.Tag !== undefined) p[`Tag${idx}`] = r.Tag;
      }
    });
    if (params.EmailType) p.EmailType = params.EmailType;
    return p;
  };

  private _parseDomainsDnsSetHostsResponse = (
    rawContent: RawDomainsDnsSetHostsCommandResponseContent
  ): DomainsDnsSetHostsCleanedResponse => {
    const res = rawContent.DomainDNSSetHostsResult?.[0]?.$;
    if (!res) throw new Error("DomainDNSSetHostsResult missing.");
    return { Domain: res.Domain, IsSuccess: res.IsSuccess === "true" };
  };

  public setHosts = async (
    params: DomainsDnsSetHostsUserParams
  ): Promise<DomainsDnsSetHostsCleanedResponse> =>
    this._makeRequest(
      "namecheap.domains.dns.setHosts",
      this._parseDomainsDnsSetHostsParams(params),
      this._parseDomainsDnsSetHostsResponse,
      "POST"
    );

  private _parseDomainsGetTldListResponse = (
    rawContent: RawDomainsGetTldListCommandResponseContent
  ): DomainsGetTldListCleanedResponse => {
    const tlds: TldListItem[] = [];
    const rawTldArray = rawContent.Tlds?.[0]?.Tld;
    if (rawTldArray) {
      rawTldArray.forEach((rt) => {
        const attrs = rt.$;
        const desc = rt._ || "";
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
        !this.tldListCache.value ||
        now - this.tldListCache.lastUpdated > CACHE_DURATION_MS;
      if (isCacheStale) {
        if (this.tldListCache.isFetching && this.tldListCache.fetchPromise)
          return this.tldListCache.fetchPromise;
        return this._fetchAndCacheTldList();
      }
      return this.tldListCache.value;
    };

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
                  Currency: "USD",
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
        !this.domainPricingCache.value ||
        now - this.domainPricingCache.lastUpdated > CACHE_DURATION_MS;
      if (isCacheStale) {
        if (
          this.domainPricingCache.isFetching &&
          this.domainPricingCache.fetchPromise
        )
          return this.domainPricingCache.fetchPromise;
        return this._fetchAndCacheDomainPricing();
      }
      return this.domainPricingCache.value;
    }
    const apiParams = this._parseUsersGetPricingParams(params);
    return this._makeRequest<
      RawUsersGetPricingCommandResponseContent,
      UsersGetPricingCleanedResponse
    >(
      "namecheap.users.getPricing",
      apiParams,
      this._parseUsersGetPricingResponse,
      "GET"
    );
  };

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
    const res = rawContent.DomainCreateResult?.$;
    if (!res) throw new Error("DomainCreateResult missing.");
    const originalCurrency = "USD";
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
    const result = rawContent.DomainGetInfoResult;
    if (!result || !result.$)
      throw new Error("DomainGetInfoResult missing/malformed.");
    const resultAttrs = result.$;
    const domainDetailsRaw = result.DomainDetails?.[0];
    const dnsDetailsRaw = result.DnsDetails?.[0];
    const whoisguardRaw = result.Whoisguard?.[0];
    const dnsDetails: NamecheapDnsDetails = {
      ProviderType: dnsDetailsRaw?.ProviderType || "UNKNOWN",
      IsUsingOurDNS: dnsDetailsRaw?.IsUsingOurDNS === "true",
      HostCount: dnsDetailsRaw?.HostCount
        ? parseInt(dnsDetailsRaw.HostCount)
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
    if (whoisguard.Enabled && whoisguard.EmailDetails?.AutoRenew !== undefined)
      autoRenewStatus = whoisguard.EmailDetails.AutoRenew;
    return {
      DomainName: resultAttrs.DomainName,
      OwnerName: resultAttrs.OwnerName,
      ID: parseInt(resultAttrs.ID),
      IsOwner: resultAttrs.IsOwner === "true",
      IsPremium: resultAttrs.IsPremium === "true",
      Status: resultAttrs.Status,
      IsLocked:
        resultAttrs.Status.toUpperCase() === "CLIENTHOLD" ||
        resultAttrs.Status.toUpperCase() === "LOCKED",
      IsOurDNS: dnsDetails.IsUsingOurDNS,
      CreatedDate: domainDetailsRaw?.CreatedDate || "N/A",
      ExpireDate: domainDetailsRaw?.ExpiredDate || "N/A",
      AutoRenew: autoRenewStatus,
      Whoisguard: whoisguard,
      DnsDetails: dnsDetails,
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

  // --- Method 8: namecheap.users.create (New) ---
  private _parseUsersCreateParams = (
    params: UsersCreateUserParams
  ): NamecheapRequestParams => {
    const apiParams: NamecheapRequestParams = {
      NewUserName: params.NewUserName,
      NewUserPassword: params.NewUserPassword,
      EmailAddress: params.EmailAddress,
      FirstName: params.FirstName,
      LastName: params.LastName,
      AcceptTerms: params.AcceptTerms ? "1" : "0", // Convert boolean to "1" or "0"
      Address1: params.Address1,
      City: params.City,
      StateProvince: params.StateProvince,
      Zip: params.Zip,
      Country: params.Country,
      Phone: params.Phone,
    };

    if (params.AcceptNews !== undefined) {
      apiParams.AcceptNews = params.AcceptNews ? "1" : "0";
    }
    if (params.JobTitle) apiParams.JobTitle = params.JobTitle;
    if (params.Organization) apiParams.Organization = params.Organization;
    if (params.Address2) apiParams.Address2 = params.Address2;
    if (params.Fax) apiParams.Fax = params.Fax;

    return apiParams;
  };

  private _parseUsersCreateResponse = (
    rawContent: RawUsersCreateCommandResponseContent
  ): UsersCreateCleanedResponse => {
    const result = rawContent.UserCreateResult?.$;
    if (!result) {
      throw new Error("UserCreateResult is missing in the API response.");
    }
    return {
      Success: result.Success === "true",
      UserId: result.UserId ? parseInt(result.UserId, 10) : undefined,
    };
  };

  /**
   * Creates a new Namecheap user account under the main ApiUser account.
   * This typically uses POST due to the amount of data, overriding example GET.
   */
  public createUser = async (
    params: UsersCreateUserParams
  ): Promise<UsersCreateCleanedResponse> => {
    const command = "namecheap.users.create";
    const apiParams = this._parseUsersCreateParams(params);
    // Using POST for create methods with many parameters is generally safer
    return this._makeRequest<
      RawUsersCreateCommandResponseContent,
      UsersCreateCleanedResponse
    >(command, apiParams, this._parseUsersCreateResponse, "POST");
  };
}

const namecheapApi = new NamecheapApiWrapper(
  process.env.NAMECHEAP_API_USER!,
  process.env.NAMECHEAP_API_KEY!,
  process.env.NAMECHEAP_API_USER!,
  process.env.PUBLIC_IP!
);

export default namecheapApi;
