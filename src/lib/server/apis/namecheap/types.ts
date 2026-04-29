export interface NamecheapRawErrorDetails {
  $: { Number: string };
  _: string;
}

export interface RawNamecheapApiResponse<TCommandResponseContent> {
  ApiResponse: {
    $: { Status: "OK" | "ERROR"; xmlns: string };
    Errors: Array<{ Error?: NamecheapRawErrorDetails[] } | string>;
    Warnings: unknown;
    RequestedCommand: string[];
    CommandResponse: Array<{ $: { Type: string } } & TCommandResponseContent>;
    Server: string[];
    GMTTimeDifference: string[];
    ExecutionTime: string[];
  };
}

export interface DomainsCheckUserParams {
  DomainList: string;
}

export interface DomainCheckResultItem {
  Domain: string;
  Available: boolean;
  ErrorNo?: string;
  Description?: string;
  IsPremiumName: boolean;

  PremiumRegistrationPrice?: number;
  PremiumRenewalPrice?: number;
  PremiumRestorePrice?: number;
  PremiumTransferPrice?: number;
  IcannFee?: number;
  EapFee?: number;
}

export interface DomainsCheckCleanedResponse {
  Results: DomainCheckResultItem[];
}

export interface RawDomainCheckResultAttributes {
  Domain: string;
  Available: "true" | "false";
  ErrorNo: string;
  Description: string;
  IsPremiumName: "true" | "false";
  PremiumRegistrationPrice: string;
  PremiumRenewalPrice: string;
  PremiumRestorePrice: string;
  PremiumTransferPrice: string;
  IcannFee: string;
  EapFee: string;
}

export interface RawDomainsCheckCommandResponseContent {
  DomainCheckResult?: Array<{ $: RawDomainCheckResultAttributes }>;
}

export type DomainsGetListListType = "ALL" | "EXPIRING" | "EXPIRED";

export type DomainsGetListSortBy =
  | "NAME"
  | "NAME_DESC"
  | "EXPIREDATE"
  | "EXPIREDATE_DESC"
  | "CREATEDATE"
  | "CREATEDATE_DESC";

export interface DomainsGetListUserParams {
  ListType?: DomainsGetListListType;
  SearchTerm?: string;
  Page?: number;
  PageSize?: number;
  SortBy?: DomainsGetListSortBy;
}

export interface DomainListItem {
  ID: number;
  Name: string;
  User: string;
  Created: string;
  Expires: string;
  IsExpired: boolean;
  IsLocked: boolean;
  AutoRenew: boolean;
  WhoisGuard: string;
  IsPremium: boolean;
  IsOurDNS: boolean;
}

export interface PagingInfo {
  TotalItems: number;
  CurrentPage: number;
  PageSize: number;
}

export interface DomainsGetListCleanedResponse {
  Domains: DomainListItem[];
  Paging: PagingInfo;
}

export interface RawDomainListItemAttributes {
  ID: string;
  Name: string;
  User: string;
  Created: string;
  Expires: string;
  IsExpired: "true" | "false";
  IsLocked: "true" | "false";
  AutoRenew: "true" | "false";
  WhoisGuard: string;
  IsPremium: "true" | "false";
  IsOurDNS: "true" | "false";
}

export interface RawDomainGetListResultContent {
  Domain?: Array<{ $: RawDomainListItemAttributes }>;
}

export interface RawPagingInfoContent {
  TotalItems: string[];
  CurrentPage: string[];
  PageSize: string[];
}

export interface RawDomainsGetListCommandResponseContent {
  DomainGetListResult?: RawDomainGetListResultContent[];
  Paging?: RawPagingInfoContent[];
}

export type DnsRecordType =
  | "A"
  | "AAAA"
  | "ALIAS"
  | "CAA"
  | "CNAME"
  | "MX"
  | "MXE"
  | "NS"
  | "TXT"
  | "URL"
  | "URL301"
  | "FRAME";

export type DnsEmailType = "MXE" | "MX" | "FWD" | "OX";

export type DnsCaaTag = "issue" | "issuewild" | "iodef";

export interface DnsHostRecord {
  HostName: string;
  RecordType: DnsRecordType;
  Address: string;
  MXPref?: number;
  TTL?: number;
  Flag?: number;
  Tag?: DnsCaaTag;
}

export interface DomainsDnsSetHostsUserParams {
  SLD: string;
  TLD: string;
  Records: DnsHostRecord[];
  EmailType?: DnsEmailType;
}

export interface DomainsDnsSetHostsCleanedResponse {
  Domain: string;
  IsSuccess: boolean;
}

export interface RawDomainDNSSetHostsResultAttributes {
  Domain: string;
  IsSuccess: "true" | "false";
}

export interface RawDomainsDnsSetHostsCommandResponseContent {
  DomainDNSSetHostsResult?: Array<{
    $: RawDomainDNSSetHostsResultAttributes;
  }>;
}

export interface TldListItem {
  Name: string;
  Description: string;
  NonRealTime: boolean;
  MinRegisterYears: number;
  MaxRegisterYears: number;
  MinRenewYears: number;
  MaxRenewYears: number;
  MinTransferYears: number;
  MaxTransferYears: number;
  IsApiRegisterable: boolean;
  IsApiRenewable: boolean;
  IsApiTransferable: boolean;
  IsEppRequired: boolean;
  IsDisableModContact: boolean;
  IsDisableWGAllot: boolean;
  IsIncludeInExtendedSearchOnly: boolean;
  SequenceNumber: number;
  Type: string;
  IsSupportsIDN: boolean;
  Category: string;
  SupportsRegistrarLock?: boolean;
  AddGracePeriodDays?: number;
  WhoisVerification?: boolean;
  ProviderApiDelete?: boolean;
  IsDisableModifications?: boolean;
}

export interface DomainsGetTldListCleanedResponse {
  Tlds: TldListItem[];
}

export interface RawTldAttributes {
  Name: string;
  NonRealTime: "true" | "false";
  MinRegisterYears: string;
  MaxRegisterYears: string;
  MinRenewYears: string;
  MaxRenewYears: string;
  MinTransferYears: string;
  MaxTransferYears: string;
  IsApiRegisterable: "true" | "false";
  IsApiRenewable: "true" | "false";
  IsApiTransferable: "true" | "false";
  IsEppRequired: "true" | "false";
  IsDisableModContact: "true" | "false";
  IsDisableWGAllot: "true" | "false";
  IsIncludeInExtendedSearchOnly: "true" | "false";
  SequenceNumber: string;
  Type: string;
  IsSupportsIDN: "true" | "false";
  Category: string;

  IsDisableModifications?: "true" | "false";
  SupportsRegistrarLock?: "true" | "false";
  AddGracePeriodDays?: string;
  WhoisVerification?: "true" | "false";
  ProviderApiDelete?: "true" | "false";
}

export interface RawDomainsGetTldListCommandResponseContent {
  Tlds?: Array<{
    Tld?: Array<{
      $: RawTldAttributes;
      _: string;
    }>;
  }>;
}

export type UsersGetPricingProductType =
  | "DOMAIN"
  | "SSLCERTIFICATE"
  | "WHOISGUARD";

export type UsersGetPricingActionName =
  | "REGISTER"
  | "RENEW"
  | "REACTIVATE"
  | "TRANSFER";

export interface UsersGetPricingUserParams {
  ProductType: UsersGetPricingProductType;
  ProductCategory?: string;
  ProductName?: string;
  ActionName?: UsersGetPricingActionName;
  PromotionCode?: string;
}

export interface ProductPriceDetail {
  Duration: number;
  DurationType: string;
  Price: number;
  RegularPrice: number;
  YourPrice: number;
  CouponPrice?: number;
  Currency: "USD" | "BRL";
}

export interface ProductPricingInfo {
  Name: string;
  Prices: ProductPriceDetail[];
}

export interface ProductCategoryPricingInfo {
  Name: string;
  Products: ProductPricingInfo[];
}

export interface ProductTypePricingInfo {
  Name: UsersGetPricingProductType;
  Categories: ProductCategoryPricingInfo[];
}

export interface UsersGetPricingCleanedResponse {
  ProductType: ProductTypePricingInfo | null;
}

export interface RawPriceAttributes {
  Duration: string;
  DurationType: string;
  Price: string;
  RegularPrice: string;
  YourPrice: string;
  CouponPrice: string;
  Currency: string;
}

export interface RawProductContent {
  $: { Name: string };
  Price: Array<{ $: RawPriceAttributes }>;
}

export interface RawProductCategoryContent {
  $: { Name: string };
  Product: RawProductContent[];
}

export interface RawProductTypeContent {
  $: { Name: string };
  ProductCategory: RawProductCategoryContent[];
}

export interface RawUsersGetPricingCommandResponseContent {
  UserGetPricingResult?: Array<{
    ProductType?: Array<RawProductTypeContent>;
  }>;
}

export interface NamecheapContactDetails {
  FirstName: string;
  LastName: string;
  OrganizationName?: string;
  Address1: string;
  Address2?: string;
  City: string;
  StateProvince: string;
  PostalCode: string;
  Country: string;
  Phone: string;
  EmailAddress: string;
}

export interface DomainsCreateUserParams {
  DomainName: string;
  Years: number;

  Registrant: NamecheapContactDetails;
  Admin: NamecheapContactDetails;
  Tech: NamecheapContactDetails;
  AuxBilling: NamecheapContactDetails;

  AddFreeWhoisguard?: "yes" | "no";
  WGEnabled?: "yes" | "no";

  IdnCode?: string;

  IsPremiumDomain?: boolean;
  PremiumPrice?: number;
  EapFee?: number;

  GenerateAdminOrderRefId?: boolean;
  Nameservers?: string[];
}

export interface DomainsCreateCleanedResponse {
  Domain: string;
  Registered: boolean;
  ChargedAmount: number;
  DomainID?: number;
  OrderID: number;
  TransactionID: number;
  WhoisguardEnable: boolean;
  NonRealTimeDomain: boolean;
}

export interface RawDomainCreateResultAttributes {
  Domain: string;
  Registered: "true" | "false";
  ChargedAmount: string;
  DomainID?: string;
  OrderID: string;
  TransactionID: string;
  WhoisguardEnable: "true" | "false";
  NonRealTimeDomain: "true" | "false";
}

export interface RawDomainsCreateCommandResponseContent {
  DomainCreateResult?: Array<{
    $: RawDomainCreateResultAttributes;
  }>;
}

export interface DomainsGetInfoUserParams {
  DomainName: string;
  HostName?: string;
}

export interface NamecheapDnsDetails {
  ProviderType: "CUSTOM" | "FREE" | "PREMIUM" | "OWN" | string;
  IsUsingOurDNS: boolean;
  HostCount: number;
  EmailType: string;
  DynamicDNSStatus: boolean;
  IsFailover: boolean;
  Nameservers: string[];
}

export interface NamecheapWhoisguardInfo {
  Enabled: boolean;
  ID?: string;
  EmailDetails?: {
    ForwardedTo: string;
    LastAutoRenew: string;
    AutoRenew: boolean;
  };
}

export interface DomainsGetInfoCleanedResponse {
  DomainName: string;
  OwnerName: string;
  ID: number;
  IsOwner: boolean;
  IsPremium: boolean;
  Status: string;
  IsLocked: boolean;
  IsOurDNS: boolean;
  CreatedDate: string;
  ExpireDate: string;
  AutoRenew: boolean;
  Whoisguard: NamecheapWhoisguardInfo;
  DnsDetails: NamecheapDnsDetails;
  Modificationrights?: {
    All: boolean;
    ChangeDNS: boolean;
  };
}

export interface RawDomainDetails {
  CreatedDate: string[];
  ExpiredDate: string[];
  NumYears?: string;
}

export interface RawDnsDetails {
  ProviderType: string;
  IsUsingOurDNS: "true" | "false";
  HostCount: string;
  EmailType: string;
  DynamicDNSStatus: "true" | "false";
  IsFailover: "true" | "false";
  Nameserver: string[];
}

export interface RawWhoisguard {
  Enabled: "true" | "false";
  ID?: string;
  EmailDetails?: {
    $: {
      ForwardedTo: string;
      LastAutoRenew: string;
      AutoRenew: "true" | "false";
    };
  };
}

export interface RawModificationrights {
  $: { All: "true" | "false"; ChangeDNS: "true" | "false" };
}

export interface RawDomainsGetInfoCommandResponseContent {
  DomainGetInfoResult?: Array<{
    $: {
      DomainName: string;
      OwnerName: string;
      ID: string;
      IsOwner: "true" | "false";
      IsPremium: "true" | "false";
      Status: string;
    };
    DomainDetails?: RawDomainDetails[];
    DnsDetails?: RawDnsDetails[];
    Whoisguard?: RawWhoisguard[];
    Modificationrights?: RawModificationrights[];
  }>;
}

export interface UsersCreateUserParams {
  NewUserName: string;
  NewUserPassword: string;
  EmailAddress: string;
  FirstName: string;
  LastName: string;
  AcceptTerms: boolean;
  AcceptNews?: boolean;
  JobTitle?: string;
  Organization?: string;
  Address1: string;
  Address2?: string;
  City: string;
  StateProvince: string;
  Zip: string;
  Country: string;
  Phone: string;
  Fax?: string;
}

export interface UsersCreateCleanedResponse {
  Success: boolean;
  UserId?: number;
}

export interface RawUserCreateResultAttributes {
  Success: "true" | "false";
  UserId?: string;
}

export interface RawUsersCreateCommandResponseContent {
  UserCreateResult?: {
    $: RawUserCreateResultAttributes;
  };
}

export type NamecheapRequestParams = Record<
  string,
  string | number | boolean | string[] | undefined
>;

export interface DomainsNsCreateUserParams {
  SLD: string;
  TLD: string;
  Nameserver: string;
  IP: string;
}

export interface DomainsNsCreateCleanedResponse {
  Domain: string;
  Nameserver: string;
  IP: string;
  IsSuccess: boolean;
}

export interface RawDomainNsCreateResultAttributes {
  Domain: string;
  Nameserver: string;
  IP: string;
  IsSuccess: "true" | "false";
}

export interface RawDomainsNsCreateCommandResponseContent {
  DomainNSCreateResult?: Array<{
    $: RawDomainNsCreateResultAttributes;
  }>;
}

export interface DomainsDnsGetHostsUserParams {
  SLD: string;
  TLD: string;
}

export interface DnsHostRecordItem {
  HostId: number;
  Name: string;
  Type: string;
  Address: string;
  MXPref?: number;
  TTL: number;
}

export interface DomainsDnsGetHostsCleanedResponse {
  Domain: string;
  IsUsingOurDNS: boolean;
  Hosts: DnsHostRecordItem[];
}

export interface RawDnsHostRecordAttributes {
  HostId: string;
  Name: string;
  Type: string;
  Address: string;
  MXPref: string;
  TTL: string;
  AssociatedAppTitle?: string;
  FriendlyName?: string;
  IsActive?: "true" | "false";
  IsDDNSEnabled?: "true" | "false";
}

export interface RawDomainsDnsGetHostsCommandResponseContent {
  DomainDNSGetHostsResult?: Array<{
    $: {
      Domain: string;
      EmailType?: string;
      IsUsingOurDNS: "true" | "false";
    };
    host?: Array<{
      $: RawDnsHostRecordAttributes;
    }>;
  }>;
}

export interface DomainsRenewUserParams {
  DomainName: string;
  Years: number;
}

export interface DomainsRenewCleanedResponse {
  Domain: string;
  Renewed: boolean;
  ChargedAmount: number;
  OrderId: number;
  TransactionId: number;
  ExpireDate: string;
}

export interface RawDomainsRenewCommandResponseContent {
  DomainRenewResult?: Array<{
    $: {
      Domain: string;
      Renewed: string;
      ChargedAmount: string;
      OrderID: string;
      TransactionID: string;
      ExpireDate: string;
    };
  }>;
}
