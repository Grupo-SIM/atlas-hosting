export interface NamecheapRawErrorDetails {
  $: { Number: string };
  _: string;
}

export interface RawNamecheapApiResponse<TCommandResponseContent> {
  ApiResponse: {
    $: { Status: "OK" | "ERROR"; xmlns: string };
    Errors: Array<{ Error?: NamecheapRawErrorDetails[] } | string>;
    Warnings: any;
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
  DomainDNSSetHostsResult?: Array<{ $: RawDomainDNSSetHostsResultAttributes }>;
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

/**
 * Cleaned representation of a TLD item from namecheap.domains.getTldList.
 * Note: This command does NOT return pricing information.
 */
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
}

export interface DomainsGetTldListCleanedResponse {
  Tlds: TldListItem[];
}

export interface RawDomainsGetTldListCommandResponseContent {
  Tlds?: Array<{
    Tld?: Array<{
      $: RawTldAttributes;
      _: string;
    }>;
  }>;
}

export interface UsersGetPricingUserParams {
  ProductType: UsersGetPricingProductType;
  ProductCategory?: string;
  ProductName?: string;
  ActionName?: UsersGetPricingActionName;
  PromotionCode?: string;
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

export interface ProductPriceDetail {
  Duration: number;
  DurationType: string;

  Price: number;
  RegularPrice: number;
  YourPrice: number;
  CouponPrice?: number;
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
  DomainCreateResult?: {
    $: RawDomainCreateResultAttributes;
  };
}

// --- For namecheap.domains.getInfo ---
export interface DomainsGetInfoUserParams {
  DomainName: string;
  HostName?: string; // Optional: To get info for a specific host
}

export interface NamecheapDnsDetails {
  ProviderType: "CUSTOM" | "FREE" | "PREMIUM" | "OWN" | string; // Namecheap uses various terms
  IsUsingOurDNS: boolean;
  HostCount: number;
  EmailType: string; // e.g., "MX", "FWD", "OX"
  DynamicDNSStatus: boolean;
  IsFailover: boolean;
  Nameservers: string[];
}

export interface NamecheapWhoisguardInfo {
  Enabled: boolean;
  ID?: string;
  EmailDetails?: {
    ForwardedTo: string;
    LastAutoRenew: string; // Date string
    AutoRenew: boolean;
  };
  // Other Whoisguard fields can be added if needed
}

export interface DomainsGetInfoCleanedResponse {
  DomainName: string;
  OwnerName: string;
  ID: number; // DomainID
  IsOwner: boolean;
  IsPremium: boolean;
  Status: string; // e.g., "Ok", "Locked"
  IsLocked: boolean;
  IsOurDNS: boolean; // Derived or directly available
  CreatedDate: string; // Date string
  ExpireDate: string; // Date string
  AutoRenew: boolean; // This might be part of Whoisguard or a separate domain setting
  Whoisguard: NamecheapWhoisguardInfo;
  DnsDetails: NamecheapDnsDetails;
  Modificationrights?: {
    All: boolean;
    ChangeDNS: boolean;
    // ... other rights
  };
  // Other fields like Nameserver, FullDnsRecords etc. can be added
}

// Raw types for XML parsing for domains.getInfo
export interface RawDomainDetails {
  CreatedDate: string;
  ExpiredDate: string; // Note: Namecheap uses ExpiredDate or ExpireDate
  NumYears?: string;
}

export interface RawDnsDetails {
  ProviderType: string;
  IsUsingOurDNS: "true" | "false";
  HostCount: string;
  EmailType: string;
  DynamicDNSStatus: "true" | "false";
  IsFailover: "true" | "false";
  Nameserver: string[]; // xml2js will put multiple <Nameserver> tags into an array
}

export interface RawWhoisguard {
  Enabled: "true" | "false";
  ID?: string;
  EmailDetails?: {
    // This structure might vary
    $: {
      ForwardedTo: string;
      LastAutoRenew: string;
      AutoRenew: "true" | "false";
    };
  };
  // ... other raw Whoisguard fields
}

export interface RawModificationrights {
  $: { All: "true" | "false"; ChangeDNS: "true" | "false" };
  // ... other rights
}

export interface RawDomainsGetInfoCommandResponseContent {
  DomainGetInfoResult?: {
    // Usually an array of 1 by xml2js default
    $: {
      // Attributes of DomainGetInfoResult
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
    // ... other potential nested elements
  };
}

// --- For namecheap.users.create ---
export interface UsersCreateUserParams {
  NewUserName: string;
  NewUserPassword: string;
  EmailAddress: string;
  FirstName: string;
  LastName: string;
  AcceptTerms: boolean; // Will be converted to "1" or "0"
  AcceptNews?: boolean; // Will be converted to "1" or "0"
  JobTitle?: string;
  Organization?: string;
  Address1: string;
  Address2?: string;
  City: string;
  StateProvince: string; // State or Province code
  Zip: string; // Postal/Zip code
  Country: string; // 2-letter country code
  Phone: string; // Format like +1.6613102107
  Fax?: string;
}

export interface UsersCreateCleanedResponse {
  Success: boolean;
  UserId?: number; // UserId might not be present if Success is false
}

// Raw types for XML parsing for users.create
export interface RawUserCreateResultAttributes {
  Success: "true" | "false";
  UserId?: string; // Optional, as it might not be there on failure
}

export interface RawUsersCreateCommandResponseContent {
  UserCreateResult?: {
    // Similar to DomainCreateResult, might be a single object
    $: RawUserCreateResultAttributes;
  };
}

export type NamecheapRequestParams = Record<
  string,
  string | number | boolean | undefined
>;

export interface NamecheapRawErrorDetails {
  $: { Number: string };
  _: string;
}

export interface RawNamecheapApiResponse<TCommandResponseContent> {
  ApiResponse: {
    $: { Status: "OK" | "ERROR"; xmlns: string };
    Errors: Array<{ Error?: NamecheapRawErrorDetails[] } | string>;
    Warnings: any;
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
  WhoisGuard: string; // e.g., "ENABLED", "NOTPRESENT"
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
  Created: string; // Date string e.g., "02/15/2016"
  Expires: string; // Date string e.g., "02/15/2022"
  IsExpired: "true" | "false";
  IsLocked: "true" | "false";
  AutoRenew: "true" | "false";
  WhoisGuard: string;
  IsPremium: "true" | "false";
  IsOurDNS: "true" | "false";
}

// Represents the <DomainGetListResult> tag which contains <Domain> tags
export interface RawDomainGetListResultContent {
  Domain?: Array<{ $: RawDomainListItemAttributes }>;
}

// Represents the <Paging> tag
export interface RawPagingInfoContent {
  TotalItems: string[]; // xml2js makes single text nodes into an array
  CurrentPage: string[];
  PageSize: string[];
}

export interface RawDomainsGetListCommandResponseContent {
  DomainGetListResult?: RawDomainGetListResultContent[]; // Array because xml2js default
  Paging?: RawPagingInfoContent[]; // Array because xml2js default
}
// --- END: Added for namecheap.domains.getList ---

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
  DomainDNSSetHostsResult?: Array<{ $: RawDomainDNSSetHostsResultAttributes }>;
}

export interface TldListItem {
  Name: string;
  Description: string; // Added this field
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
  IsDisableModContact: boolean; // Added this field based on RawTldAttributes
  IsDisableWGAllot: boolean;
  IsIncludeInExtendedSearchOnly: boolean;
  SequenceNumber: number;
  Type: string;
  IsSupportsIDN: boolean;
  Category: string;
  SupportsRegistrarLock: boolean; // Added
  AddGracePeriodDays: number; // Added
  WhoisVerification: boolean; // Added
  ProviderApiDelete: boolean; // Added
  IsDisableModifications?: boolean; // Made optional as per Raw
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
  AddGracePeriodDays?: string; // e.g. "10" or "" if not applicable
  WhoisVerification?: "true" | "false";
  ProviderApiDelete?: "true" | "false";
}

export interface RawDomainsGetTldListCommandResponseContent {
  Tlds?: Array<{
    Tld?: Array<{
      $: RawTldAttributes;
      _: string; // This captures the description text node for the TLD
    }>;
  }>;
}

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
  Currency: "USD" | "BRL"; // Added Currency field
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
