// types.ts

// ========= Core Types =========

export interface NamecheapConfig {
  apiUser: string;
  apiKey: string;
  userName?: string; // Defaults to apiUser if not provided
  clientIp: string;
  useSandbox?: boolean; // Defaults to false (production)
  logRequests?: boolean; // Optional: for debugging
}

export interface NamecheapError {
  Number: string;
  Message: string;
  [key: string]: string; // For unknown other attributes like line number, etc.
}

export interface NamecheapApiResponse<T> {
  "@_Status": "OK" | "ERROR";
  Errors: { Error: NamecheapError | NamecheapError } | "";
  Warnings?: { Warning: NamecheapError | NamecheapError } | ""; // Warnings can also occur
  RequestedCommand: string;
  CommandResponse: {
    "@_Type": string;
    [key: string]: T | unknown; // The key here is the command-specific result tag
  };
  Server: string;
  GMTTimeDifference: string;
  ExecutionTime: string;
}

export interface PagingInfo {
  TotalItems: number;
  CurrentPage: number;
  PageSize: number;
}

/**
 * Represents contact information for various roles (Registrant, Admin, Tech, AuxBilling).
 * Fields are based on Namecheap API documentation for creating/updating contacts. [1, 2]
 */
export interface ContactDetails {
  OrganizationName?: string;
  JobTitle?: string;
  FirstName: string;
  LastName: string;
  Address1: string;
  Address2?: string;
  City: string;
  StateProvince: string;
  StateProvinceChoice?: string; // 'S' for State, 'P' for Province, or blank
  PostalCode: string;
  Country: string; // Two-letter country code
  Phone: string; // Format: +NNN.NNNNNNNNNN
  PhoneExt?: string;
  Fax?: string; // Format: +NNN.NNNNNNNNNN
  EmailAddress: string;
}

/**
 * Interface for providing contact parameters in API requests.
 * All fields are prefixed for the specific contact type (e.g., RegistrantFirstName).
 */
export interface ContactParams {
  RegistrantOrganizationName?: string;
  RegistrantJobTitle?: string;
  RegistrantFirstName: string;
  RegistrantLastName: string;
  RegistrantAddress1: string;
  RegistrantAddress2?: string;
  RegistrantCity: string;
  RegistrantStateProvince: string;
  RegistrantStateProvinceChoice?: string;
  RegistrantPostalCode: string;
  RegistrantCountry: string;
  RegistrantPhone: string;
  RegistrantPhoneExt?: string;
  RegistrantFax?: string;
  RegistrantEmailAddress: string;
  TechOrganizationName?: string;
  TechJobTitle?: string;
  TechFirstName: string;
  TechLastName: string;
  TechAddress1: string;
  TechAddress2?: string;
  TechCity: string;
  TechStateProvince: string;
  TechStateProvinceChoice?: string;
  TechPostalCode: string;
  TechCountry: string;
  TechPhone: string;
  TechPhoneExt?: string;
  TechFax?: string;
  TechEmailAddress: string;
  AdminOrganizationName?: string;
  AdminJobTitle?: string;
  AdminFirstName: string;
  AdminLastName: string;
  AdminAddress1: string;
  AdminAddress2?: string;
  AdminCity: string;
  AdminStateProvince: string;
  AdminStateProvinceChoice?: string;
  AdminPostalCode: string;
  AdminCountry: string;
  AdminPhone: string;
  AdminPhoneExt?: string;
  AdminFax?: string;
  AdminEmailAddress: string;
  AuxBillingOrganizationName?: string;
  AuxBillingJobTitle?: string;
  AuxBillingFirstName: string;
  AuxBillingLastName: string;
  AuxBillingAddress1: string;
  AuxBillingAddress2?: string;
  AuxBillingCity: string;
  AuxBillingStateProvince: string;
  AuxBillingStateProvinceChoice?: string;
  AuxBillingPostalCode: string;
  AuxBillingCountry: string;
  AuxBillingPhone: string;
  AuxBillingPhoneExt?: string;
  AuxBillingFax?: string;
  AuxBillingEmailAddress: string;
  // Billing contact fields are optional for create, not typically used for setContacts directly
  BillingFirstName?: string;
  BillingLastName?: string;
  BillingAddress1?: string;
  BillingAddress2?: string;
  BillingCity?: string;
  BillingStateProvince?: string;
  BillingStateProvinceChoice?: string;
  BillingPostalCode?: string;
  BillingCountry?: string;
  BillingPhone?: string;
  BillingPhoneExt?: string;
  BillingFax?: string;
  BillingEmailAddress?: string;
}

/**
 * Placeholder for TLD-specific extended attributes. [3]
 * Keys and values depend on the TLD.
 * Example: { RegistrantNexus: "C11", RegistrantPurpose: "P1" }
 */
export type ExtendedAttributesParams = Record<string, string>;

// ========= domains =========

export interface DomainsGetListParams {
  listType?: "ALL" | "EXPIRING" | "EXPIRED"; // [4]
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?:
    | "NAME"
    | "NAME_DESC"
    | "EXPIREDATE"
    | "EXPIREDATE_DESC"
    | "CREATEDATE"
    | "CREATEDATE_DESC";
}

export interface DomainEntry {
  ID: number;
  Name: string;
  User: string;
  Created: string;
  Expires: string;
  IsExpired: boolean;
  IsLocked: boolean;
  AutoRenew: boolean;
  WhoisGuard: "ENABLED" | "NOTPRESENT" | "DISABLED" | "N/A" | string; // N/A observed in some cases
  IsPremium: boolean;
  IsOurDNS: boolean;
}

export interface DomainsGetListCommandResponse {
  DomainGetListResult: {
    Domain?: DomainEntry | DomainEntry;
  };
  Paging: PagingInfo;
}

export interface DomainsGetContactsParams {
  domainName: string; // [5]
}

export interface ContactDetailsApiResponse extends ContactDetails {
  "@_ReadOnly": string; // Parsed to boolean by the client
}

export interface CurrentAttributes {
  RegistrantNexus?: string;
  RegistrantNexusCountry?: string;
  RegistrantPurpose?: string;
}

export interface WhoisGuardContactDetails {
  Registrant: ContactDetailsApiResponse;
  Tech: ContactDetailsApiResponse;
  Admin: ContactDetailsApiResponse;
  AuxBilling: ContactDetailsApiResponse;
}
export interface DomainsGetContactsCommandResponse {
  DomainContactsResult: {
    "@_Domain": string;
    "@_domainnameid": string; // Parsed to number
    Registrant: ContactDetailsApiResponse;
    Tech: ContactDetailsApiResponse;
    Admin: ContactDetailsApiResponse;
    AuxBilling: ContactDetailsApiResponse;
    CurrentAttributes?: CurrentAttributes;
    WhoisGuardContact?: WhoisGuardContactDetails; // [5]
  };
}

export interface DomainsCreateParams extends ContactParams {
  domainName: string; // [1]
  years: number;
  promotionCode?: string;
  idnCode?: string;
  extendedAttributes?: ExtendedAttributesParams; // [1, 3]
  nameservers?: string; // Comma-separated string for API, client should handle array conversion
  addFreeWhoisguard?: "yes" | "no"; // [1, 6]
  wgEnabled?: "yes" | "no"; // [1, 6]
  isPremiumDomain?: boolean;
  premiumPrice?: number;
  eapFee?: number;
}

export interface DomainsCreateCommandResponse {
  DomainCreateResult: {
    "@_Domain": string;
    "@_Registered": string; // Parsed to boolean
    "@_ChargedAmount": string; // Parsed to number
    "@_DomainID": string; // Parsed to number
    "@_OrderID": string; // Parsed to number
    "@_TransactionID": string; // Parsed to number
    "@_WhoisguardEnable": string; // Parsed to boolean
    "@_NonRealTimeDomain": string; // Parsed to boolean
  };
}

export interface TldInfo {
  "@_Name": string;
  "@_NonRealTime": string; // Parsed to boolean
  "@_MinRegisterYears": string; // Parsed to number
  "@_MaxRegisterYears": string; // Parsed to number
  "@_MinRenewYears": string; // Parsed to number
  "@_MaxRenewYears": string; // Parsed to number
  "@_MinTransferYears": string; // Parsed to number
  "@_MaxTransferYears": string; // Parsed to number
  "@_IsApiRegisterable": string; // Parsed to boolean
  "@_IsApiRenewable": string; // Parsed to boolean
  "@_IsApiTransferable": string; // Parsed to boolean
  "@_IsEppRequired": string; // Parsed to boolean
  "@_IsDisableModContact": string; // Parsed to boolean
  "@_IsDisableWGAllot": string; // Parsed to boolean
  "@_IsIncludeInExtendedSearchOnly": string; // Parsed to boolean
  "@_SequenceNumber": string; // Parsed to number
  "@_Type": string; // e.g., "gTLD", "ccTLD"
  "@_IsSupportsIDN": string; // Parsed to boolean
  "@_Category": string;
  // Other attributes from [7] can be added
  "@_IsSupportsRegistrarLock"?: string; // Parsed to boolean
  "@_IsSupportsTransferOutConfirmation"?: string; // Parsed to boolean
  "@_IsSupportsPrivacyProtect"?: string; // Parsed to boolean
  "@_IsSupportsDelete"?: string; // Parsed to boolean
  "@_IsSupportsRestore"?: string; // Parsed to boolean
  "@_IsSupportsParking"?: string; // Parsed to boolean
  "@_IsSupportsDNSSEC"?: string; // Parsed to boolean
  "@_IsSupportsTrustee"?: string; // Parsed to boolean
  "@_IsSupportsLocalPresence"?: string; // Parsed to boolean
  "@_IsPremium"?: string; // Parsed to boolean
  "@_IsSupportsBulkRegister"?: string; // Parsed to boolean
  "@_IsSupportsBulkRenew"?: string; // Parsed to boolean
  "@_IsSupportsBulkTransfer"?: string; // Parsed to boolean
  "@_IsDomainNiceToHave"?: string; // Parsed to boolean
  "@_IsFreeWGAllot"?: string; // Parsed to boolean
}

export interface DomainsGetTldListCommandResponse {
  Tlds: {
    Tld?: TldInfo | TldInfo; // [7]
  };
}

export interface DomainsSetContactsParams extends ContactParams {
  domainName: string; // [2]
  extendedAttributes?: ExtendedAttributesParams; // [3, 2]
}

export interface DomainsSetContactsCommandResponse {
  DomainSetContactsResult: {
    "@_Domain": string;
    "@_IsSuccess": string; // Parsed to boolean
  };
}

export interface DomainsCheckParams {
  domainList: string | string; // Client converts array to comma-separated string [8]
}

export interface DomainCheckResultItem {
  "@_Domain": string;
  "@_Available": string; // Parsed to boolean
  "@_ErrorNo"?: string; // Parsed to number
  "@_Description"?: string;
  "@_IsPremiumName": string; // Parsed to boolean
  "@_PremiumRegistrationPrice"?: string; // Parsed to number
  "@_PremiumRenewalPrice"?: string; // Parsed to number
  "@_PremiumRestorePrice"?: string; // Parsed to number
  "@_PremiumTransferPrice"?: string; // Parsed to number
  "@_IcannFee"?: string; // Parsed to number
  "@_EapFee"?: string; // Parsed to number
}

export interface DomainsCheckCommandResponse {
  DomainCheckResult?: DomainCheckResultItem | DomainCheckResultItem; // [8]
}

export interface DomainsReactivateParams {
  domainName: string; // [9]
  promotionCode?: string;
  yearsToAdd?: number;
  isPremiumDomain?: boolean;
  premiumPrice?: number;
}

export interface DomainsReactivateCommandResponse {
  DomainReactivateResult: {
    "@_Domain": string;
    "@_IsSuccess": string; // Parsed to boolean
    "@_ChargedAmount": string; // Parsed to number
    "@_OrderID": string; // Parsed to number
    "@_TransactionID": string; // Parsed to number
  };
}

export interface DomainsRenewParams {
  domainName: string; // [10]
  years: number;
  promotionCode?: string;
  isPremiumDomain?: boolean;
  premiumPrice?: number;
}

export interface DomainRenewDetails {
  ExpiredDate: string;
  NumYears: number;
}

export interface DomainsRenewCommandResponse {
  DomainRenewResult: {
    "@_DomainName": string;
    "@_DomainID": string; // Parsed to number
    "@_Renew": string; // Parsed to boolean
    "@_OrderID": string; // Parsed to number
    "@_TransactionID": string; // Parsed to number
    "@_ChargedAmount": string; // Parsed to number
    DomainDetails?: DomainRenewDetails; // [10]
  };
}

export interface DomainsGetRegistrarLockParams {
  domainName: string; // [11]
}

export interface DomainsGetRegistrarLockCommandResponse {
  DomainGetRegistrarLockResult: {
    "@_Domain": string;
    "@_RegistrarLockStatus": string; // Parsed to boolean
  };
}

export interface DomainsSetRegistrarLockParams {
  domainName: string; // [12]
  lockAction?: "LOCK" | "UNLOCK"; // Default: 'LOCK'
}

export interface DomainsSetRegistrarLockCommandResponse {
  DomainSetRegistrarLockResult: {
    "@_Domain": string;
    "@_IsSuccess": string; // Parsed to boolean
  };
}

export interface DomainsGetInfoParams {
  domainName: string; // [13]
  hostName?: string;
}

export interface DomainDetailsInfo {
  CreatedDate: string;
  ExpiredDate: string;
  NumYears?: number; // Not in all examples, but possible
}

export interface WhoisguardInfo {
  "@_Enabled": string; // Parsed to boolean
  ID?: string; // Parsed to number
  ExpiredDate?: string;
  EmailDetails?: {
    ForwardedTo: string;
    LastAutoChangeDate?: string; // Optional
    AutoChangeFrequencyDays?: string; // Optional
  };
}

export interface DnsDetailsInfo {
  "@_ProviderType":
    | "CUSTOM"
    | "FREE"
    | "BASIC"
    | "PREMIUM"
    | "ENOM"
    | "OWN"
    | string; // OWN is another possibility
  "@_IsUsingOurDNS": string; // Parsed to boolean
  Nameserver?: string | string;
  HostCount?: number;
  EmailType?: string; // e.g., MX, MXE, FWD, OX
  DynamicDNSStatus?: string; // Parsed to boolean
}

export interface ModificationRightsInfo {
  "@_All"?: string; // Parsed to boolean
  "@_Contacts"?: string; // Parsed to boolean
  "@_Hosts"?: string; // Parsed to boolean
  "@_Nameservers"?: string; // Parsed to boolean
}

export interface PremiumDnsSubscriptionInfo {
  UseAutoRenew: boolean;
  SubscriptionId: number;
  CreatedDate: string;
  ExpireDate: string;
  IsActive: boolean;
}

export interface DomainsGetInfoCommandResponse {
  DomainGetInfoResult: {
    "@_Status": "Ok" | "Locked" | "Expired" | string;
    "@_ID": string; // Parsed to number
    "@_DomainName": string;
    "@_OwnerName": string;
    "@_IsOwner": string; // Parsed to boolean
    "@_IsPremium"?: string; // Parsed to boolean
    DomainDetails: DomainDetailsInfo;
    LockDetails?: unknown; // Structure not fully detailed
    Whoisguard: WhoisguardInfo;
    PremiumDnsSubscription?: PremiumDnsSubscriptionInfo;
    DnsDetails: DnsDetailsInfo;
    Modificationrights: ModificationRightsInfo;
    // Other potential nested elements like Eap
  };
}

// ========= domains.dns =========

export interface DomainsDnsSetDefaultParams {
  sld: string; // [14]
  tld: string;
}

export interface DomainsDnsSetDefaultCommandResponse {
  DomainDNSSetDefaultResult: {
    "@_Domain": string;
    "@_Updated": string; // Parsed to boolean
  };
}

export interface DomainsDnsSetCustomParams {
  sld: string; // [15]
  tld: string;
  nameservers: string | string; // Client converts array to comma-separated string
}

export interface DomainsDnsSetCustomCommandResponse {
  DomainDNSSetCustomResult: {
    "@_Domain": string;
    "@_Updated": string; // Parsed to boolean
  };
}

export interface DomainsDnsGetListParams {
  sld: string; // [16]
  tld: string;
}

export interface DomainsDnsGetListCommandResponse {
  DomainDNSGetListResult: {
    "@_Domain": string;
    "@_IsUsingOurDNS": string; // Parsed to boolean
    Nameserver?: string | string;
  };
}

export interface DomainsDnsGetHostsParams {
  sld: string; // [17]
  tld: string;
}

export interface HostRecord {
  "@_HostId": string; // Parsed to number
  "@_Name": string;
  "@_Type":
    | "A"
    | "AAAA"
    | "CNAME"
    | "MX"
    | "MXE"
    | "TXT"
    | "URL"
    | "URL301"
    | "FRAME"
    | string;
  "@_Address": string;
  "@_MXPref"?: string; // Parsed to number, only for MX/MXE
  "@_TTL": string; // Parsed to number
  "@_AssociatedAppTitle"?: string;
  "@_FriendlyName"?: string;
  "@_IsActive"?: string; // Parsed to boolean
  "@_IsDDNSEnabled"?: string; // Parsed to boolean
}

export interface DomainsDnsGetHostsCommandResponse {
  DomainDNSGetHostsResult: {
    "@_Domain": string;
    "@_EmailType"?:
      | "MX"
      | "MXE"
      | "OX"
      | "FORWARD"
      | "GSUITE"
      | "PRIVATEEMAIL"
      | string; // [17]
    "@_IsUsingOurDNS": string; // Parsed to boolean
    host?: HostRecord | HostRecord;
  };
}

export interface DomainsDnsGetEmailForwardingParams {
  domainName: string; // [18]
}

export interface EmailForwardingRecord {
  "@_mailbox": string;
  "#text": string; // The forwarding address
}

export interface DomainsDnsGetEmailForwardingCommandResponse {
  DomainDNSGetEmailForwardingResult: {
    "@_Domain": string;
    Forward?: EmailForwardingRecord | EmailForwardingRecord;
  };
}

export interface EmailForwardingRule {
  mailBox: string;
  forwardTo: string;
}

export interface DomainsDnsSetEmailForwardingParams {
  domainName: string; // [19]
  rules: EmailForwardingRule; // Client maps to MailBoxN and ForwardToN
}

export interface DomainsDnsSetEmailForwardingCommandResponse {
  DomainDNSSetEmailForwardingResult: {
    "@_Domain": string;
    "@_IsSuccess": string; // Parsed to boolean
  };
}

export interface HostRecordParams {
  hostName: string;
  recordType:
    | "A"
    | "AAAA"
    | "CNAME"
    | "MX"
    | "MXE"
    | "TXT"
    | "URL"
    | "URL301"
    | "FRAME";
  address: string;
  mxPref?: number; // Required for MX/MXE
  ttl?: number; // Default: 1800
}

export interface DomainsDnsSetHostsParams {
  sld: string; // Based on Namecheap docs for namecheap.domains.dns.setHosts
  tld: string;
  hosts: HostRecordParams; // Client maps to HostNameN, RecordTypeN, etc.
  emailType?: "MX" | "MXE" | "FWD" | "OX" | "NONE" | "GSUITE" | "PRIVATEEMAIL"; // [6] added OX
}

export interface DomainsDnsSetHostsCommandResponse {
  DomainDNSSetHostsResult: {
    "@_Domain": string;
    "@_IsSuccess": string; // Parsed to boolean
  };
}

// ========= domains.ns =========

export interface DomainsNsCreateParams {
  sld: string; // [20]
  tld: string;
  nameserver: string;
  ip: string; // IPv4
}

export interface DomainsNsCreateCommandResponse {
  DomainNSCreateResult: {
    "@_Domain": string;
    "@_Nameserver": string;
    "@_IP": string;
    "@_IsSuccess": string; // Parsed to boolean
  };
}

export interface DomainsNsDeleteParams {
  sld: string; // [21]
  tld: string;
  nameserver: string;
}

export interface DomainsNsDeleteCommandResponse {
  DomainNSDeleteResult: {
    "@_Domain": string;
    "@_Nameserver": string;
    "@_IsSuccess": string; // Parsed to boolean
  };
}

export interface DomainsNsGetInfoParams {
  sld: string; // [22]
  tld: string;
  nameserver: string;
}

export interface NameserverStatus {
  Status: string; // e.g., "OK", "Linked"
}
export interface DomainsNsGetInfoCommandResponse {
  DomainNSInfoResult: {
    "@_Domain": string;
    "@_Nameserver": string;
    "@_IP": string;
    NameserverStatuses?: { Status: NameserverStatus | NameserverStatus }; // [22]
    Status?: string; // Overall status
  };
}

export interface DomainsNsUpdateParams {
  sld: string; // [23]
  tld: string;
  nameserver: string;
  oldIp: string;
  ip: string; // New IP
}

export interface DomainsNsUpdateCommandResponse {
  DomainNSUpdateResult: {
    "@_Domain": string;
    "@_Nameserver": string;
    "@_IsSuccess": string; // Parsed to boolean
  };
}

// ========= domains.transfer =========

export interface DomainsTransferCreateParams {
  domainName: string; // [24, 25, 26]
  years: number; // Typically 1 for transfers
  eppCode: string; // May need Base64 encoding if special chars [6]
  promotionCode?: string;
  addFreeWhoisguard?: "yes" | "no";
  wgEnabled?: "yes" | "no";
  extendedAttributes?: ExtendedAttributesParams; // [3]
  // Billing contact details might also be supported/required for some transfers.
  // Refer to official Namecheap docs for full list for specific TLDs.
  // Reusing ContactParams for potential billing info
  BillingFirstName?: string;
  BillingLastName?: string;
  BillingAddress1?: string;
  BillingAddress2?: string;
  BillingCity?: string;
  BillingStateProvince?: string;
  BillingPostalCode?: string;
  BillingCountry?: string;
  BillingPhone?: string;
  BillingEmailAddress?: string;
}

export interface DomainsTransferCreateCommandResponse {
  DomainTransferCreateResult: {
    "@_DomainName": string;
    "@_Transfer": string; // Parsed to boolean
    "@_ChargedAmount": string; // Parsed to number
    "@_OrderID": string; // Parsed to number
    "@_TransactionID": string; // Parsed to number
    "@_WhoisguardEnable"?: string; // Parsed to boolean
    "@_NonRealTimeDomain"?: string; // Parsed to boolean
    "@_TransferID"?: string; // Parsed to number (The actual TransferID)
  };
}

export interface DomainsTransferGetStatusParams {
  transferId: number; // [27]
}

export interface DomainsTransferGetStatusCommandResponse {
  DomainTransferGetStatusResult: {
    "@_TransferID": string; // Parsed to number
    "@_StatusID": string; // Parsed to number, see [28] for status ID mapping
    "@_Status": string;
    "@_StatusDate"?: string;
    "@_EPPAuthCodeRequired"?: string; // Parsed to boolean
    "@_OrderID"?: string; // Parsed to number
    "@_TransferDate"?: string;
    // Other details might be present
  };
}

export interface DomainsTransferUpdateStatusParams {
  transferId: number; // [24, 26, 29]
  resubmit?: boolean;
  cancel?: boolean;
  // Only one of resubmit or cancel should be true.
}

export interface DomainsTransferUpdateStatusCommandResponse {
  DomainTransferUpdateStatusResult: {
    "@_TransferID": string; // Parsed to number
    "@_StatusID": string; // Parsed to number
    "@_Status": string;
    "@_IsSuccess"?: string; // Parsed to boolean
  };
}

export interface DomainsTransferGetListParams {
  listType?: "ALL" | "INPROGRESS" | "CANCELLED" | "COMPLETED"; // [30]
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?:
    | "DOMAINNAME"
    | "DOMAINNAME_DESC"
    | "TRANSFERDATE"
    | "TRANSFERDATE_DESC"
    | "STATUSDATE"
    | "STATUSDATE_DESC";
}

export interface TransferEntry {
  "@_ID": string; // Parsed to number (TransferID)
  "@_Domainname": string;
  "@_User": string;
  "@_TransferDate": string;
  "@_OrderID": string; // Parsed to number
  "@_StatusID": string; // Parsed to number
  "@_Status": string;
  "@_StatusDate": string;
  "@_StatusDescription": string;
}

export interface DomainsTransferGetListCommandResponse {
  TransferGetListResult: {
    Transfer?: TransferEntry | TransferEntry;
  };
  Paging: PagingInfo;
}

// ========= ssl =========

export type SslProductType =
  | "PositiveSSL"
  | "EssentialSSL"
  | "InstantSSL"
  | "InstantSSL Pro"
  | "PremiumSSL"
  | "EV SSL"
  | "PositiveSSL Wildcard"
  | "EssentialSSL Wildcard"
  | "PremiumSSL Wildcard"
  | "PositiveSSL Multi Domain"
  | "Multi Domain SSL"
  | "Unified Communications"
  | "EV Multi Domain SSL"
  | string; // string for unknown new types

export interface SslCreateParams {
  years: 1 | 2; // 3-5 year certs no longer available [6, 31]
  type: SslProductType; // [31]
  sansToADD?: number; // For multi-domain certs
  promotionCode?: string;
}

export interface SslCreateResult {
  "@_IsSuccess": string; // Parsed to boolean
  "@_OrderId": string; // Parsed to number
  "@_TransactionId": string; // Parsed to number
  "@_ChargedAmount": string; // Parsed to number
  SSLCertificate: {
    "@_CertificateID": string; // Parsed to number
    "@_Created": string;
    "@_SSLType": string;
    "@_Years": string; // Parsed to number
    "@_Status": string; // e.g., "NewPurchase"
  };
}
export interface SslCreateCommandResponse {
  SSLCreateResult: SslCreateResult;
}

export type SslListType =
  | "ALL"
  | "Processing"
  | "EmailSent"
  | "TechnicalProblem"
  | "InProgress"
  | "Completed"
  | "Deactivated"
  | "Active"
  | "Cancelled"
  | "NewPurchase"
  | "NewRenewal"
  | string;
export type SslSortByType =
  | "PURCHASEDATE"
  | "PURCHASEDATE_DESC"
  | "SSLTYPE"
  | "SSLTYPE_DESC"
  | "EXPIREDATETIME"
  | "EXPIREDATETIME_DESC"
  | "Host_Name"
  | "Host_Name_DESC"
  | string;

export interface SslGetListParams {
  listType?: SslListType; // [32]
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: SslSortByType;
}

export interface SslEntry {
  "@_CertificateID": string; // Parsed to number
  "@_HostName": string;
  "@_SSLType": string;
  "@_PurchaseDate": string;
  "@_ExpireDate": string;
  "@_ActivationExpireDate": string;
  "@_IsExpiredYN": string; // Parsed to boolean [32]
  "@_Status": string;
}

export interface SslGetListCommandResponse {
  SSLListResult: {
    SSL?: SslEntry | SslEntry;
  };
  Paging: PagingInfo;
}

export interface SslParseCSRParams {
  csr: string; // URL-encoded [25]
  certificateType?: SslProductType; // Recommended
}

export interface CsrDetails {
  CommonName: string;
  DomainName: string;
  Country: string;
  OrganisationUnit?: string; // OU
  Organisation?: string; // O
  ValidTrueDomain?: string; // Parsed to boolean, GeoTrust only
  State?: string; // ST
  Locality?: string; // L
  Email?: string;
  DNSNames?: string; // Comma-separated list
}

export interface SslParseCSRCommandResponse {
  SSLParseCSRResult: {
    CSRDetails: CsrDetails;
  };
}

export interface SslGetApproverEmailListParams {
  domainName: string; // [33]
  certificateType: SslProductType;
}

export interface ApproverEmailList {
  // Structure can be complex, often a mix of direct emails and categorized lists.
  // For simplicity, providing a way to access all emails is useful.
  // The API might return <all><Email>...</Email></all> or nested structures.
  // The client should normalize this into a flat list of strings.
  DomainEmails?: { Email: string | string };
  GenericEmails?: { Email: string | string };
  ApproverEmails?: { Email: string | string }; // This tag is seen in some examples
  all?: string; // A consolidated list of all approver emails, processed by client
}

export interface SslGetApproverEmailListCommandResponse {
  GetApproverEmailListResult: {
    "@_domain": string;
    // The actual structure can vary, e.g., <ApproverEmails><Email>...</Email></ApproverEmails>
    // or <DomainEmails>, <GenericEmails>.
    // The client should attempt to parse these into a usable list.
    [key: string]: unknown; // To accommodate various structures
  };
}

export interface SslActivateParams {
  certificateId: number; // [34]
  csr: string; // URL-encoded
  adminEmailAddress: string;
  webServerType?: string; // See [34] for allowed values
  approverEmail?: string; // Required if not using HTTPDCValidation or DNSDCValidation
  httpdcValidation?: boolean; // Sets all domains to HTTP DCV
  dnsdcValidation?: boolean; // Sets all domains to CNAME DCV

  // Multi-domain specific
  dnsNames?: string; // Comma-separated for API
  dnsApproverEmails?: string; // Comma-separated, corresponds to dnsNames

  // OV & EV Parameters
  adminOrganizationName?: string;
  organizationDepartment?: string;
  adminCountry?: string; // Required for EV
  adminStateProvince?: string; // Required for EV
  adminCity?: string; // Required for EV
  adminAddress1?: string; // Required for EV
  adminAddress2?: string;
  adminPostalCode?: string; // Required for EV
  adminPhone?: string;
  adminPhoneExt?: string; // [6]
  organizationDUNS?: string;

  // EV Only Parameters
  compunknownIncorporationCountry?: string; // Required for EV
  compunknownIncorporationStateProvince?: string;
  compunknownIncorporationLocality?: string;
  compunknownIncorporationDate?: string;
  compunknownDBA?: string;
  compunknownRegistrationNumber?: string;

  // OV Only Parameters
  organizationRepFirstName?: string;
  organizationRepLastName?: string;
  organizationRepTitle?: string;
  organizationRepPhone?: string;
  organizationRepEmailAddress?: string;

  uniqueValue?: string; // [34]
}

export interface DcvNameValue {
  "@_domain": string;
  FileName?: string; // For HTTP DCV
  FileContent?: string; // For HTTP DCV
  HostName?: string; // For DNS DCV (left part of CNAME)
  Target?: string; // For DNS DCV (right part of CNAME)
}

export interface SslActivateCommandResponse {
  SSLActivateResult: {
    "@_ID": string; // Parsed to number (CertificateID)
    "@_IsSuccess": string; // Parsed to boolean
    HttpDCValidation?: {
      "@_ValueAvailable": string; // Parsed to boolean
      DNS?: DcvNameValue | DcvNameValue; // Name 'DNS' is misleading, it's per-domain HTTP info
    };
    DNSDCValidation?: {
      "@_ValueAvailable": string; // Parsed to boolean
      DNS?: DcvNameValue | DcvNameValue; // Per-domain DNS CNAME info
    };
  };
}

export interface SslResendApproverEmailParams {
  certificateId: string; // [35]
}

export interface SslResendApproverEmailCommandResponse {
  SSLResendApproverEmailResult: {
    "@_ID": string; // Parsed to number (CertificateID)
    "@_IsSuccess": string; // Parsed to boolean
  };
}

export interface SslGetInfoParams {
  certificateId: number; // [36]
  returnCertificate?: boolean; // String "true"/"false" for API
  returnType?: "Individual" | "PKCS7"; // Required if returnCertificate is true
}

export interface ProviderInfo {
  Name: string;
  OrderID?: string; // Parsed to number
}
export interface CertificateDetails {
  CommonName: string;
  OcspMustStaple?: string; // Parsed to boolean
  DNSNames?: { DNSName: string | string };
  Country: string;
  State: string;
  Locality: string;
  Organization: string;
  OrganizationUnit: string;
  ValidFrom: string;
  ValidTill: string;
  KeyAlgorithm: string;
  KeySize: string;
  SerialNumber: string;
  AdministratorFirstName?: string; // Optional in some contexts
  AdministratorLastName?: string; // Optional
  AdministratorPhone?: string; // Optional
  AdministratorEmail?: string; // Optional
  AdministratorTitle?: string;
  AdministratorOrganization?: string;
  //... and more fields if present
}
export interface CertificateData {
  "@_CertificateReturned": string; // Parsed to boolean
  "@_ReturnType": "Individual" | "PKCS7" | string;
  Certificate?: string; // Actual certificate data
  CaCertificate?: string; // CA bundle
}

export interface SslGetInfoCommandResponse {
  SSLGetInfoResult: {
    "@_Status": string; // e.g., "active", "newpurchase" [36]
    "@_StatusDescription": string;
    "@_Type": string; // SSL Product Type
    "@_Issuedon": string;
    "@_Expires": string;
    "@_ActivationExpireDate": string;
    "@_ReplacedBy"?: string; // Parsed to number (CertificateID)
    "@_SANSCount"?: string; // Parsed to number
    Provider: ProviderInfo;
    CertificateDetails?: CertificateDetails;
    Certificates?: CertificateData;
    HttpDCValidationDetails?: unknown; // Structure for DCV info if applicable
    DnsDCValidationDetails?: unknown; // Structure for DCV info if applicable
    WhoisVerification?: {
      Status?: string;
      EmailAddress?: string;
    };
  };
}

export interface SslRenewParams {
  certificateId: number; // ID of cert to renew [37]
  years: 1 | 2; // Years for new cert (3-5 deprecated [6])
  sslType: SslProductType;
  promotionCode?: string;
}

export interface SslRenewCommandResponse {
  SSLRenewResult: {
    "@_CertificateID": string; // Parsed to number (ID of NEW cert)
    "@_Years": string; // Parsed to number
    "@_OrderId": string; // Parsed to number
    "@_TransactionId": string; // Parsed to number
    "@_ChargedAmount": string; // Parsed to number
  };
}

// SslReissueParams are very similar to SslActivateParams [38]
export interface SslReissueParams
  extends Omit<SslActivateParams, "adminEmailAddress"> {
  // AdminEmailAddress cannot be changed during reissue [38]
}

// SslReissueCommandResponse is similar to SslActivateCommandResponse [38]
export interface SslReissueCommandResponse extends SslActivateCommandResponse {}

export interface SslResendFulfillmentEmailParams {
  certificateId: string; // [39]
}

export interface SslResendFulfillmentEmailCommandResponse {
  SSLResendFulfillmentEmailResult: {
    "@_ID": string; // Parsed to number (CertificateID)
    "@_IsSuccess": string; // Parsed to boolean
  };
}

export interface SslPurchaseMoreSansParams {
  certificateId: number; // [40]
  numberOfSANSToAdd: number;
}

export interface SslPurchaseMoreSansResult {
  "@_IsSuccess": string; // Parsed to boolean
  "@_OrderId": string; // Parsed to number
  "@_TransactionId": string; // Parsed to number
  "@_ChargedAmount": string; // Parsed to number
  SSLCertificate: {
    "@_CertificateID": string; // Parsed to number
    "@_SSLType": string;
    "@_Years": string; // Parsed to number
    "@_Status": string;
    "@_SANSCount": string; // Parsed to number (new total SANs)
  };
}
export interface SslPurchaseMoreSansCommandResponse {
  SSLPurchaseMoreSANSResult: SslPurchaseMoreSansResult;
}

export interface SslRevokeCertificateParams {
  certificateId: number; // [41]
  certificateType: SslProductType; // Supported for Comodo certs only
}

export interface SslRevokeCertificateCommandResponse {
  SSLRevokeCertificateResult: {
    "@_CertificateID": string; // Parsed to number
    "@_IsSuccess": string; // Parsed to boolean
  };
}

export type DcvMethod = "EMAIL" | "HTTP_CSR_HASH" | "CNAME_CSR_HASH" | string; // string for specific email

export interface SslEditDCVMethodParamsBase {
  certificateId: number; // [42]
}

export interface SslEditDCVMethodSingleDomainParams
  extends SslEditDCVMethodParamsBase {
  dcvMethod: DcvMethod;
  dnsNames?: never;
  dcvMethods?: never;
}

export interface SslEditDCVMethodMultiDomainParams
  extends SslEditDCVMethodParamsBase {
  dnsNames: string; // Comma-separated for API
  dcvMethods: string; // Comma-separated for API, must correspond to dnsNames
  dcvMethod?: never;
}

export type SslEditDCVMethodParams =
  | SslEditDCVMethodSingleDomainParams
  | SslEditDCVMethodMultiDomainParams;

export interface DcvDomainResult {
  "@_Name": string;
  "@_IsSuccess": string; // Parsed to boolean
  "@_DCVMethodSet": string; // The method that was set
}
export interface SslEditDCVMethodCommandResponse {
  SSLEditDCVMethodResult: {
    "@_ID": string; // Parsed to number (CertificateID)
    "@_IsSuccess": string; // Parsed to boolean (overall success)
    HttpDCValidation?: {
      "@_ValueAvailable": string; // Parsed to boolean
      DNS?: DcvNameValue | DcvNameValue;
    };
    DNSDCValidation?: {
      "@_ValueAvailable": string; // Parsed to boolean
      DNS?: DcvNameValue | DcvNameValue;
    };
    Domains?: {
      Domain?: DcvDomainResult | DcvDomainResult;
    };
  };
}

// ========= users =========

export type ProductTypePricing =
  | "DOMAIN"
  | "SSLCERTIFICATE"
  | "WHOISGUARD"
  | string; // [43] WHOISGUARD from [43] notes
export type ProductCategoryDomain =
  | "DOMAINS"
  | "REGISTER"
  | "RENEW"
  | "REACTIVATE"
  | "TRANSFER"
  | "SUNRISE"
  | "LANDRUSH"
  | "PREORDER"
  | string;
export type ProductCategorySsl =
  | "COMODO"
  | "PURCHASE"
  | "RENEW"
  | "INSTANTSSL"
  | string; // And others
export type ActionNameDomain =
  | "REGISTER"
  | "RENEW"
  | "REACTIVATE"
  | "TRANSFER"
  | string;
export type ActionNameSsl = "PURCHASE" | "RENEW" | string;

export interface UsersGetPricingParams {
  productType: ProductTypePricing; // [43]
  productCategory?: ProductCategoryDomain | ProductCategorySsl;
  promotionCode?: string;
  actionName?: ActionNameDomain | ActionNameSsl;
  productName?: string; // e.g., "COM", "INSTANTSSL"
}

export interface ProductPrice {
  "@_Duration": string; // Parsed to number
  "@_DurationType": string; // e.g., "YEAR"
  "@_Price": string; // Parsed to number (final price)
  "@_RegularPrice": string; // Parsed to number
  "@_YourPrice": string; // Parsed to number
  "@_CouponPrice": string; // Parsed to number
  "@_AdditionalCost"?: string; // Parsed to number [43]
  "@_AdditionalCostType"?: string;
  "@_RegularPriceType"?: string;
  "@_YourPriceType"?: string;
  "@_CouponPriceType"?: string;
  "@_PricingType"?: "multiple" | "absolute" | string; // [43]
  // Other price attributes might exist
}

export interface ProductPricingInfo {
  "@_Name": string; // e.g., "com", "positivessl"
  Price?: ProductPrice | ProductPrice;
}

export interface ProductCategoryPricing {
  "@_Name": string; // e.g., "register", "comodo"
  Product?: ProductPricingInfo | ProductPricingInfo;
}

export interface UsersGetPricingCommandResponse {
  UserGetPricingResult: {
    "@_ProductType": string;
    Currency?: string; // Usually "USD"
    ProductCategory?: ProductCategoryPricing | ProductCategoryPricing;
    // For ProductType=DOMAIN, products might be directly under UserGetPricingResult
    // or nested under a single ProductCategory if specified.
    // For ProductType=WHOISGUARD, it might be a direct Product element.
    // The structure needs to be flexible.
    Product?: ProductPricingInfo | ProductPricingInfo; // Direct product list for some types
  };
}

export interface UsersGetBalancesCommandResponse {
  UserGetBalancesResult: {
    "@_Currency": string;
    "@_AvailableBalance": string; // Parsed to number
    "@_AccountBalance": string; // Parsed to number
    "@_EarnedAmount": string; // Parsed to number
    "@_WithdrawableAmount": string; // Parsed to number
    "@_FundsRequiredForAutoRenew": string; // Parsed to number [44]
  };
}

export interface UsersChangePasswordWithOldPassParams {
  oldPassword: string; // [45]
  newPassword: string;
  resetCode?: never;
}

export interface UsersChangePasswordWithResetCodeParams {
  resetCode: string; // [45]
  newPassword: string;
  oldPassword?: never;
}

export type UsersChangePasswordParams =
  | UsersChangePasswordWithOldPassParams
  | UsersChangePasswordWithResetCodeParams;

export interface UsersChangePasswordCommandResponse {
  UserChangePasswordResult: {
    "@_Success": string; // Parsed to boolean
    "@_UserId": string; // Parsed to number
  };
}

export interface UsersUpdateParams {
  firstName?: string; // [46]
  lastName?: string;
  jobTitle?: string;
  organization?: string;
  address1?: string;
  address2?: string;
  city?: string;
  stateProvince?: string;
  zip?: string;
  country?: string; // Two-letter code
  phone?: string; // Format: +NNN.NNNNNNNNNN
  phoneExt?: string; // [6]
  fax?: string; // Format: +NNN.NNNNNNNNNN
  emailAddress?: string;
  acceptNews?: 0 | 1;
}

export interface UsersUpdateCommandResponse {
  // The actual tag name might vary, e.g., UserProfileUpdateResult or UserUpdateResult
  [key: string]: {
    // Using a generic key to match potential result tag names
    "@_Success": string; // Parsed to boolean
  };
}

export interface UsersCreateAddFundsRequestParams {
  username: string; // Username to add funds to [47, 48]
  paymentType: "Creditcard"; // Only 'Creditcard' is documented
  amount: number;
  returnUrl: string; // URL to redirect after payment
}

export interface UsersCreateAddFundsRequestCommandResponse {
  Createaddfundsrequestresult: {
    // Note the case from example [47]
    "@_TokenID": string;
    "@_RedirectURL": string;
    "@_ReturnURL": string;
  };
}

export interface UsersGetAddFundsStatusParams {
  tokenId: string; // [49]
}

export type AddFundsStatus =
  | "CREATED"
  | "SUBMITTED"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED"
  | string;
export interface UsersGetAddFundsStatusCommandResponse {
  GetAddFundsStatusResult: {
    "@_TransactionID": string; // Parsed to number
    "@_Amount": string; // Parsed to number
    "@_Status": AddFundsStatus;
  };
}

export interface UsersCreateParams {
  newUserName: string; // [50]
  newUserPassword: string;
  emailAddress: string;
  ignoreDuplicateEmailAddress?: "yes" | "no"; // Default: 'yes'
  firstName: string;
  lastName: string;
  acceptTerms: 1; // Must be 1
  acceptNews?: 0 | 1;
  jobTitle?: string;
  organization?: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  zip: string;
  country: string; // Two-letter code
  phone: string; // Format: +NNN.NNNNNNNNNN
  phoneExt?: string;
  fax?: string; // Format: +NNN.NNNNNNNNNN
}

export interface UsersCreateCommandResponse {
  UserCreateResult: {
    "@_Success": string; // Parsed to boolean
    "@_UserId": string; // Parsed to number
    "@_NewUserName"?: string; // Not in example, but could be useful
  };
}

export interface UsersLoginParams {
  // UserName is a global parameter, used as the login username
  password: string; // [24]
}

export interface UsersLoginCommandResponse {
  // Tag name might differ, e.g., UserLoginValidationResult or UserLoginResult
  [key: string]: {
    "@_Success": string; // Parsed to boolean
    "@_UserID"?: string; // Parsed to number, potentially
  };
}

export interface UsersResetPasswordParams {
  findBy: "EMAILADDRESS" | "DOMAINNAME" | "USERNAME"; // [51]
  findByValue: string;
  emailFromName?: string;
  emailFrom?: string;
  urlPattern?: string; // e.g., "http://yourdomain.com/reset?code="
}

export interface UsersResetPasswordCommandResponse {
  UserResetPasswordResult: {
    // Actual tag name might vary
    "@_Success": string; // Parsed to boolean
    Email?: string; // Email where reset link was sent
  };
}

// ========= users.address =========

export interface UsersAddressCreateParams {
  addressName: string; // [52]
  defaultYN?: 0 | 1; // 1 for true
  emailAddress: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  organization?: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  stateProvinceChoice: string; // 'S', 'P', or blank
  zip: string;
  country: string; // Two-letter code
  phone: string; // Format: +NNN.NNNNNNNNNN
  phoneExt?: string;
  fax?: string;
}

export interface UsersAddressCreateCommandResponse {
  AddressCreateResult: {
    "@_Success": string; // Parsed to boolean
    "@_AddressId": string; // Parsed to number
    "@_AddressName": string;
  };
}

export interface UsersAddressDeleteParams {
  addressId: number; // [53]
}

export interface UsersAddressDeleteCommandResponse {
  AddressDeleteResult: {
    "@_Success": string; // Parsed to boolean
    "@_ProfileId"?: string; // Parsed to number (AddressId)
    "@_AddressId"?: string; // Parsed to number (AddressId) - seen in some docs
    "@_UserName"?: string;
  };
}

export interface UsersAddressGetInfoParams {
  addressId: number; // [54]
}

export interface AddressInfo extends ContactDetails {
  AddressName: string;
  Default_YN: boolean; // Parsed from string
  // Other fields from ContactDetails are present here
}
export interface UsersAddressGetInfoCommandResponse {
  GetAddressInfoResult: {
    // [54]
    AddressId: string; // Parsed to number
    UserName: string;
    AddressName: string;
    Default_YN: string; // Parsed to boolean
    FirstName: string;
    LastName: string;
    JobTitle?: string;
    Organization?: string;
    Address1: string;
    Address2?: string;
    City: string;
    StateProvince: string;
    StateProvinceChoice: string;
    Zip: string;
    Country: string;
    Phone: string;
    Fax?: string;
    PhoneExt?: string;
    EmailAddress: string;
  };
}

export interface UsersAddressGetListCommandResponse {
  AddressGetListResult: {
    List?:
      | {
          // [55]
          "@_AddressId": string; // Parsed to number
          "@_AddressName": string;
          "@_IsDefault"?: string; // Parsed to boolean
        }
      | Array<{
          "@_AddressId": string;
          "@_AddressName": string;
          "@_IsDefault"?: string;
        }>;
  };
}

export interface UsersAddressSetDefaultParams {
  addressId: number; // [56]
}

export interface UsersAddressSetDefaultCommandResponse {
  AddressSetDefaultResult: {
    "@_Success": string; // Parsed to boolean
    "@_AddressId": string; // Parsed to number
  };
}

export interface UsersAddressUpdateParams extends UsersAddressCreateParams {
  addressId: number; // [57]
}

export interface UsersAddressUpdateCommandResponse {
  AddressUpdateResult: {
    "@_Success": string; // Parsed to boolean
    "@_AddressId": string; // Parsed to number
    "@_AddressName": string;
  };
}

// ========= domainprivacy (WhoisGuard) =========
// Note: API might still use "Whoisguard" in tags/attributes [1]

export interface DomainPrivacyChangeEmailAddressParams {
  whoisguardId: string; // [58, 59] (Number in some docs, string in others)
  // email address to change to is not specified as a param, API might generate it
}

export interface DomainPrivacyChangeEmailAddressCommandResponse {
  WhoisguardChangeEmailAddressResult: {
    // Tag name from [58]
    "@_ID": string; // Parsed to number (WhoisguardID)
    "@_IsSuccess": string; // Parsed to boolean
    "@_WGEmail": string; // New email
    "@_WGOldEmail": string; // Old email
  };
}

export interface DomainPrivacyEnableParams {
  whoisguardId: number; // [60]
  forwardedToEmail: string;
}

export interface DomainPrivacyEnableCommandResponse {
  WhoisguardEnableResult: {
    // Tag name from example
    "@_DomainName"?: string; // Optional, as per example
    "@_IsSuccess": string; // Parsed to boolean
    "@_ID"?: string; // Parsed to number (WhoisguardID)
  };
}

export interface DomainPrivacyDisableParams {
  whoisguardId: number; // [61]
}

export interface DomainPrivacyDisableCommandResponse {
  WhoisguardDisableResult: {
    // Tag name from example
    "@_DomainName"?: string; // Optional
    "@_IsSuccess": string; // Parsed to boolean
    "@_ID"?: string; // Parsed to number (WhoisguardID)
  };
}

export interface DomainPrivacyGetListParams {
  listType?: "ALL" | "ALLOTED" | "FREE" | "DISCARD" | string; // [62]
  page?: number;
  pageSize?: number;
}

export interface DomainPrivacySubscription {
  "@_ID": string; // Parsed to number (WhoisguardID)
  "@_DomainName": string; // Can be empty if unused
  "@_Created": string;
  "@_Expires": string; // Can be empty
  "@_Status":
    | "unused"
    | "alloted"
    | "disabled"
    | "enabled"
    | "expired"
    | string;
  "@_EmailAddress"?: string; // Forwarded email
}

export interface DomainPrivacyGetListCommandResponse {
  WhoisguardGetListResult: {
    // Tag name from [62]
    Whoisguard?: DomainPrivacySubscription | DomainPrivacySubscription;
  };
  Paging?: PagingInfo; // Paging is present in some getList results
}

export interface DomainPrivacyRenewParams {
  whoisguardId: string; // [63] (Number in some docs, string in others)
  years: number;
  promotionCode?: string; // Docs say number, but promo codes are usually strings
}

export interface DomainPrivacyRenewCommandResponse {
  WhoisguardRenewResult: {
    // Tag name from [63]
    "@_WhoisguardId": string; // Parsed to number
    "@_Years": string; // Parsed to number
    "@_Renew": string; // Parsed to boolean
    "@_OrderId": string; // Parsed to number
    "@_TransactionId": string; // Parsed to number
    "@_ChargedAmount": string; // Parsed to number
  };
}
