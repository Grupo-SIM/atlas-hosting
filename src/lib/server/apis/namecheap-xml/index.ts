import { XMLParser } from "fast-xml-parser"; // Example import
import type {
  DomainPrivacyChangeEmailAddressCommandResponse,
  DomainPrivacyChangeEmailAddressParams,
  DomainPrivacyDisableCommandResponse,
  DomainPrivacyDisableParams,
  DomainPrivacyEnableCommandResponse,
  DomainPrivacyEnableParams,
  DomainPrivacyGetListCommandResponse,
  DomainPrivacyGetListParams,
  DomainPrivacyRenewCommandResponse,
  DomainPrivacyRenewParams,
  DomainsCheckCommandResponse,
  DomainsCheckParams,
  DomainsCreateCommandResponse,
  DomainsCreateParams,
  DomainsDnsGetEmailForwardingCommandResponse,
  DomainsDnsGetEmailForwardingParams,
  DomainsDnsGetHostsCommandResponse,
  DomainsDnsGetHostsParams,
  DomainsDnsGetListCommandResponse,
  DomainsDnsGetListParams,
  DomainsDnsSetCustomCommandResponse,
  DomainsDnsSetCustomParams,
  DomainsDnsSetDefaultCommandResponse,
  DomainsDnsSetDefaultParams,
  DomainsDnsSetEmailForwardingCommandResponse,
  DomainsDnsSetEmailForwardingParams,
  DomainsDnsSetHostsCommandResponse,
  DomainsDnsSetHostsParams,
  DomainsGetContactsCommandResponse,
  DomainsGetContactsParams,
  DomainsGetInfoCommandResponse,
  DomainsGetInfoParams,
  DomainsGetListCommandResponse,
  DomainsGetListParams,
  DomainsGetRegistrarLockCommandResponse,
  DomainsGetRegistrarLockParams,
  DomainsGetTldListCommandResponse,
  DomainsNsCreateCommandResponse,
  DomainsNsCreateParams,
  DomainsNsDeleteCommandResponse,
  DomainsNsDeleteParams,
  DomainsNsGetInfoCommandResponse,
  DomainsNsGetInfoParams,
  DomainsNsUpdateCommandResponse,
  DomainsNsUpdateParams,
  DomainsReactivateCommandResponse,
  DomainsReactivateParams,
  DomainsRenewCommandResponse,
  DomainsRenewParams,
  DomainsSetContactsCommandResponse,
  DomainsSetContactsParams,
  DomainsSetRegistrarLockCommandResponse,
  DomainsSetRegistrarLockParams,
  DomainsTransferCreateCommandResponse,
  DomainsTransferCreateParams,
  DomainsTransferGetListCommandResponse,
  DomainsTransferGetListParams,
  DomainsTransferGetStatusCommandResponse,
  DomainsTransferGetStatusParams,
  DomainsTransferUpdateStatusCommandResponse,
  DomainsTransferUpdateStatusParams,
  EmailForwardingRule,
  HostRecordParams,
  NamecheapApiResponse,
  NamecheapConfig,
  NamecheapError,
  RequestParams,
  SslActivateCommandResponse,
  SslActivateParams,
  SslCreateCommandResponse,
  SslCreateParams,
  SslEditDCVMethodCommandResponse,
  SslEditDCVMethodParams,
  SslGetApproverEmailListCommandResponse,
  SslGetApproverEmailListParams,
  SslGetInfoCommandResponse,
  SslGetInfoParams,
  SslGetListCommandResponse,
  SslGetListParams,
  SslParseCSRCommandResponse,
  SslParseCSRParams,
  SslPurchaseMoreSansCommandResponse,
  SslPurchaseMoreSansParams,
  SslReissueCommandResponse,
  SslReissueParams,
  SslRenewCommandResponse,
  SslRenewParams,
  SslResendApproverEmailCommandResponse,
  SslResendApproverEmailParams,
  SslResendFulfillmentEmailCommandResponse,
  SslResendFulfillmentEmailParams,
  SslRevokeCertificateCommandResponse,
  SslRevokeCertificateParams,
  UsersAddressCreateCommandResponse,
  UsersAddressCreateParams,
  UsersAddressDeleteCommandResponse,
  UsersAddressDeleteParams,
  UsersAddressGetInfoCommandResponse,
  UsersAddressGetInfoParams,
  UsersAddressGetListCommandResponse,
  UsersAddressSetDefaultCommandResponse,
  UsersAddressSetDefaultParams,
  UsersAddressUpdateCommandResponse,
  UsersAddressUpdateParams,
  UsersChangePasswordCommandResponse,
  UsersChangePasswordParams,
  UsersCreateAddFundsRequestCommandResponse,
  UsersCreateAddFundsRequestParams,
  UsersCreateCommandResponse,
  UsersCreateParams,
  UsersGetAddFundsStatusCommandResponse,
  UsersGetAddFundsStatusParams,
  UsersGetBalancesCommandResponse,
  UsersGetPricingCommandResponse,
  UsersGetPricingParams,
  UsersLoginCommandResponse,
  UsersLoginParams,
  UsersResetPasswordCommandResponse,
  UsersResetPasswordParams,
  UsersUpdateCommandResponse,
  UsersUpdateParams,
} from "./types";

// Helper to ensure a value is an array
function ensureArray<T>(data: T | T | undefined): T {
  if (data === undefined) return undefined as T;
  // @ts-expect-error We don't know the type of data, but we want to ensure it's an array
  return Array.isArray(data) ? data : [data];
}

export class NamecheapApiClient {
  private config: Required<NamecheapConfig>;
  private baseUrl: string;

  constructor(config: NamecheapConfig) {
    this.config = {
      logRequests: false,
      userName: config.apiUser, // Default userName to apiUser
      useSandbox: false,
      ...config,
    };
    this.baseUrl = this.config.useSandbox
      ? "https://api.sandbox.namecheap.com/xml.response"
      : "https://api.namecheap.com/xml.response"; //

    // Initialize XML parser here. Example with fast-xml-parser:
    this.xmlParser = new XMLParser({
      attributeNamePrefix: "@_",
      ignoreAttributes: false,
      parseAttributeValue: true,
      parseTagValue: true,
      // Define paths that should always be arrays for consistency
      //   isArray: (name, jpath) => {
      //     const arrayPaths = [
      //       "ApiResponse.Errors.Error",
      //     "ApiResponse.CommandResponse.DomainCheckResult",
      //     "ApiResponse.CommandResponse.DomainRenewDetails",

      //     return arrayPaths.includes(jpath);
      //   }
    });
  }

  private async request<
    TResponsePayload,
    TRequestParams extends RequestParams | undefined =
      | RequestParams
      | undefined,
  >(
    command: string,
    params: TRequestParams,
    method: "GET" | "POST" = "GET"
  ): Promise<NamecheapApiResponse<TResponsePayload>> {
    const globalParams: Record<string, string> = {
      ApiKey: this.config.apiKey,
      ApiUser: this.config.apiUser,
      ClientIp: this.config.clientIp,
      Command: command,
      UserName: this.config.userName,
    };

    let allParams: Record<string, string | number | boolean> = {
      ...globalParams,
    };

    if (params) {
      // Omit UserName if changing password with a reset code
      if (
        command === "namecheap.users.changePassword" &&
        "resetCode" in params &&
        params.resetCode
      ) {
        Object.assign(globalParams, { UserName: undefined });
      }

      let apiParams: Record<string, string | number | boolean> = {};
      for (const key in params) {
        if (params[key as keyof RequestParams] !== undefined) {
          const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
          if (Array.isArray(params[key as keyof RequestParams])) {
            apiParams[pascalKey] = (
              params[key as keyof RequestParams] as unknown[]
            ).join(",");
          } else {
            // @ts-expect-error We don't know the type of the params
            apiParams[pascalKey] = params[key];
          }
        }
      }

      // Special handling for indexed array parameters
      if (
        command === "namecheap.domains.dns.setHosts" &&
        "hosts" in params &&
        params.hosts
      ) {
        // @ts-expect-error We don't know the type of the params
        for (const [host, index] of params.hosts as HostRecordParams) {
          const i = index + 1;
          apiParams[`HostName${i}`] = host.hostName;
          apiParams[`RecordType${i}`] = host.recordType;
          apiParams[`Address${i}`] = host.address;
          if (host.mxPref !== undefined) apiParams[`MXPref${i}`] = host.mxPref;
          if (host.ttl !== undefined) apiParams[`TTL${i}`] = host.ttl;
        }
        Object.assign(apiParams, { Hosts: undefined });
      }
      if (
        command === "namecheap.domains.dns.setEmailForwarding" &&
        "rules" in params &&
        params.rules
      ) {
        // @ts-expect-error We don't know the type of the params
        (params.rules as EmailForwardingRule).forEach((rule, index) => {
          const i = index + 1;
          apiParams = rule.mailBox;
          apiParams = rule.forwardTo;
        });
      }

      allParams = { ...globalParams, ...apiParams };
    }

    const queryParams = new URLSearchParams();
    for (const key in allParams) {
      if (allParams[key] !== undefined) {
        queryParams.append(key, String(allParams[key]));
      }
    }

    let url = this.baseUrl;
    const fetchOptions: RequestInit = { method };

    if (method === "GET") {
      url += `?${queryParams.toString()}`;
    } else {
      // POST
      fetchOptions.body = queryParams;
      fetchOptions.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
      };
    }

    if (this.config.logRequests) {
      console.log(`Namecheap API Request: ${method} ${url}`);
      if (method === "POST")
        console.log(`POST Body: ${queryParams.toString()}`);
    }

    try {
      const response = await fetch(url, fetchOptions);
      const xmlText = await response.text();

      if (this.config.logRequests) {
        console.log(`Namecheap API Response XML: ${xmlText}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${xmlText}`);
      }

      // Placeholder for actual XML parsing. You MUST replace this with a real parser.
      let parsedXml: unknown;
      try {
        // Example using fast-xml-parser (uncomment when installed and configured)
        // const parsedData = this.xmlParser.parse(xmlText);
        // parsedXml = parsedData.ApiResponse;

        // This is a very basic mock and will not work correctly.
        if (xmlText.includes('<ApiResponse Status="ERROR">')) {
          parsedXml = {
            "@_Status": "ERROR",
            CommandResponse: { "@_Type": command },
            Errors: {
              Error: {
                Message:
                  "XML parsing placeholder error. Implement a real XML parser.",
                Number: "0",
              },
            },
            ExecutionTime: "0.1",
            GMTTimeDifference: "0",
            RequestedCommand: command,
            Server: "MockServer",
          };
        } else {
          parsedXml = {
            "@_Status": "OK",
            CommandResponse: {
              "@_Type": command /*... payload from parser... */,
            },
            Errors: "",
            ExecutionTime: "0.1",
            GMTTimeDifference: "0",
            RequestedCommand: command,
            Server: "MockServer",
          };
        }
      } catch (e) {
        throw new Error(
          `Failed to parse XML response: ${e}. Raw XML: ${xmlText}`
        );
      }

      const apiResponse = parsedXml as NamecheapApiResponse<TResponsePayload>;

      if (apiResponse["@_Status"] === "ERROR") {
        const e = ensureArray(
          (
            apiResponse.Errors as Exclude<
              (typeof apiResponse)["Errors"],
              undefined | ""
            >
          )?.Error
        );

        const errors: NamecheapError[] = Array.isArray(e) ? e : [e];

        const errorMessages =
          errors.map(err => `Error ${err.Number}: ${err.Message}`).join(", ") ||
          "Unknown error";
        throw new Error(`Namecheap API Error for ${command}: ${errorMessages}`);
      }

      // Post-processing and data normalization would happen here after real parsing.
      // e.g., converting string booleans/numbers to their proper types, ensuring arrays.

      return apiResponse;
    } catch (error) {
      if (this.config.logRequests) {
        console.error(`Namecheap API Error: ${error}`);
      }
      throw error;
    }
  }

  // --- Domains Methods ---
  public domains = {
    /**
     * Checks the availability of domains. [4, 5]
     */
    check: (
      params: DomainsCheckParams
    ): Promise<NamecheapApiResponse<DomainsCheckCommandResponse>> => {
      const apiParams = { ...params } as DomainsCheckParams;

      if (Array.isArray(apiParams.domainList)) {
        apiParams.domainList = apiParams.domainList.join(",");
      }

      return this.request<DomainsCheckCommandResponse>(
        "namecheap.domains.check",
        { DomainList: apiParams.domainList } as RequestParams
      );
    },
    /**
     * Registers a new domain name. Recommended to use POST.
     */
    create: (
      params: DomainsCreateParams
    ): Promise<NamecheapApiResponse<DomainsCreateCommandResponse>> => {
      const { ...apiParams } = params;
      return this.request<DomainsCreateCommandResponse>(
        "namecheap.domains.create",
        apiParams,
        "POST"
      );
    },
    /**
     * Gets contact information of the requested domain. [2]
     */
    getContacts: (
      params: DomainsGetContactsParams
    ): Promise<NamecheapApiResponse<DomainsGetContactsCommandResponse>> => {
      return this.request<DomainsGetContactsCommandResponse>(
        "namecheap.domains.getContacts",
        params
      );
    },
    /**
     * Returns information about the requested domain.
     */
    getInfo: (
      params: DomainsGetInfoParams
    ): Promise<NamecheapApiResponse<DomainsGetInfoCommandResponse>> => {
      return this.request<DomainsGetInfoCommandResponse>(
        "namecheap.domains.getInfo",
        params
      );
    },
    /**
     * Returns a list of domains for the particular user. [1]
     */
    getList: (
      params?: DomainsGetListParams
    ): Promise<NamecheapApiResponse<DomainsGetListCommandResponse>> => {
      return this.request<
        DomainsGetListCommandResponse,
        DomainsGetListParams | undefined
      >("namecheap.domains.getList", params);
    },
    /**
     * Gets the RegistrarLock status of the requested domain. [6]
     */
    getRegistrarLock: (
      params: DomainsGetRegistrarLockParams
    ): Promise<
      NamecheapApiResponse<DomainsGetRegistrarLockCommandResponse>
    > => {
      return this.request<DomainsGetRegistrarLockCommandResponse>(
        "namecheap.domains.getRegistrarLock",
        params
      );
    },
    /**
     * Returns a list of TLDs.
     */
    getTldList: (): Promise<
      NamecheapApiResponse<DomainsGetTldListCommandResponse>
    > => {
      return this.request<DomainsGetTldListCommandResponse, undefined>(
        "namecheap.domains.getTldList",
        undefined
      );
    },
    /**
     * Reactivates an expired domain.
     */
    reactivate: (
      params: DomainsReactivateParams
    ): Promise<NamecheapApiResponse<DomainsReactivateCommandResponse>> => {
      return this.request<DomainsReactivateCommandResponse>(
        "namecheap.domains.reactivate",
        params,
        "POST"
      );
    },
    /**
     * Renews an expiring domain.
     */
    renew: (
      params: DomainsRenewParams
    ): Promise<NamecheapApiResponse<DomainsRenewCommandResponse>> => {
      return this.request<DomainsRenewCommandResponse>(
        "namecheap.domains.renew",
        params,
        "POST"
      );
    },
    /**
     * Sets contact information for the domain. [3]
     */
    setContacts: (
      params: DomainsSetContactsParams
    ): Promise<NamecheapApiResponse<DomainsSetContactsCommandResponse>> => {
      return this.request<DomainsSetContactsCommandResponse>(
        "namecheap.domains.setContacts",
        params,
        "POST"
      );
    },
    /**
     * Sets the RegistrarLock status for a domain.
     */
    setRegistrarLock: (
      params: DomainsSetRegistrarLockParams
    ): Promise<
      NamecheapApiResponse<DomainsSetRegistrarLockCommandResponse>
    > => {
      return this.request<DomainsSetRegistrarLockCommandResponse>(
        "namecheap.domains.setRegistrarLock",
        params
      );
    },
  };

  // --- Domains.Dns Methods ---
  public domainsDns = {
    /**
     * Gets email forwarding settings for the requested domain.
     */
    getEmailForwarding: (
      params: DomainsDnsGetEmailForwardingParams
    ): Promise<
      NamecheapApiResponse<DomainsDnsGetEmailForwardingCommandResponse>
    > => {
      return this.request<DomainsDnsGetEmailForwardingCommandResponse>(
        "namecheap.domains.dns.getEmailForwarding",
        params
      );
    },
    /**
     * Retrieves DNS host record settings for the requested domain.
     */
    getHosts: (
      params: DomainsDnsGetHostsParams
    ): Promise<NamecheapApiResponse<DomainsDnsGetHostsCommandResponse>> => {
      return this.request<DomainsDnsGetHostsCommandResponse>(
        "namecheap.domains.dns.getHosts",
        params
      );
    },
    /**
     * Gets a list of DNS servers associated with the requested domain.
     */
    getList: (
      params: DomainsDnsGetListParams
    ): Promise<NamecheapApiResponse<DomainsDnsGetListCommandResponse>> => {
      return this.request<DomainsDnsGetListCommandResponse>(
        "namecheap.domains.dns.getList",
        params
      );
    },
    /**
     * Sets domain to use custom DNS servers.
     */
    setCustom: (
      params: DomainsDnsSetCustomParams
    ): Promise<NamecheapApiResponse<DomainsDnsSetCustomCommandResponse>> => {
      const apiParams = { ...params } as DomainsDnsSetCustomParams;
      if (Array.isArray(apiParams.nameservers)) {
        apiParams.nameservers = apiParams.nameservers.join(",");
      }
      return this.request<DomainsDnsSetCustomCommandResponse>(
        "namecheap.domains.dns.setCustom",
        { ...apiParams, Nameservers: apiParams.nameservers } as RequestParams
      );
    },
    /**
     * Sets domain to use Namecheap's default DNS servers.
     */
    setDefault: (
      params: DomainsDnsSetDefaultParams
    ): Promise<NamecheapApiResponse<DomainsDnsSetDefaultCommandResponse>> => {
      return this.request<DomainsDnsSetDefaultCommandResponse>(
        "namecheap.domains.dns.setDefault",
        params
      );
    },
    /**
     * Sets email forwarding for a domain name.
     */
    setEmailForwarding: (
      params: DomainsDnsSetEmailForwardingParams
    ): Promise<
      NamecheapApiResponse<DomainsDnsSetEmailForwardingCommandResponse>
    > => {
      return this.request<DomainsDnsSetEmailForwardingCommandResponse>(
        "namecheap.domains.dns.setEmailForwarding",
        params,
        "POST"
      );
    },
    /**
     * Sets DNS host records settings for the requested domain.
     */
    setHosts: (
      params: DomainsDnsSetHostsParams
    ): Promise<NamecheapApiResponse<DomainsDnsSetHostsCommandResponse>> => {
      return this.request<DomainsDnsSetHostsCommandResponse>(
        "namecheap.domains.dns.setHosts",
        params,
        "POST"
      );
    },
  };

  // --- Domains.Ns Methods ---
  public domainsNs = {
    /**
     * Creates a new nameserver.
     */
    create: (
      params: DomainsNsCreateParams
    ): Promise<NamecheapApiResponse<DomainsNsCreateCommandResponse>> => {
      return this.request<DomainsNsCreateCommandResponse>(
        "namecheap.domains.ns.create",
        params
      );
    },
    /**
     * Deletes a nameserver associated with the requested domain.
     */
    delete: (
      params: DomainsNsDeleteParams
    ): Promise<NamecheapApiResponse<DomainsNsDeleteCommandResponse>> => {
      return this.request<DomainsNsDeleteCommandResponse>(
        "namecheap.domains.ns.delete",
        params
      );
    },
    /**
     * Retrieves information about a registered nameserver.
     */
    getInfo: (
      params: DomainsNsGetInfoParams
    ): Promise<NamecheapApiResponse<DomainsNsGetInfoCommandResponse>> => {
      return this.request<DomainsNsGetInfoCommandResponse>(
        "namecheap.domains.ns.getInfo",
        params
      );
    },
    /**
     * Updates the IP address of a registered nameserver.
     */
    update: (
      params: DomainsNsUpdateParams
    ): Promise<NamecheapApiResponse<DomainsNsUpdateCommandResponse>> => {
      return this.request<DomainsNsUpdateCommandResponse>(
        "namecheap.domains.ns.update",
        params
      );
    },
  };

  // --- Domains.Transfer Methods ---
  public domainsTransfer = {
    /**
     * Transfers a domain to Namecheap.
     */
    create: (
      params: DomainsTransferCreateParams
    ): Promise<NamecheapApiResponse<DomainsTransferCreateCommandResponse>> => {
      return this.request<DomainsTransferCreateCommandResponse>(
        "namecheap.domains.transfer.create",
        params,
        "POST"
      );
    },
    /**
     * Gets the list of domain transfers. [7, 8]
     */
    getList: (
      params?: DomainsTransferGetListParams
    ): Promise<NamecheapApiResponse<DomainsTransferGetListCommandResponse>> => {
      return this.request<DomainsTransferGetListCommandResponse>(
        "namecheap.domains.transfer.getList",
        params
      );
    },
    /**
     * Gets the status of a particular transfer.
     */
    getStatus: (
      params: DomainsTransferGetStatusParams
    ): Promise<
      NamecheapApiResponse<DomainsTransferGetStatusCommandResponse>
    > => {
      return this.request<DomainsTransferGetStatusCommandResponse>(
        "namecheap.domains.transfer.getStatus",
        params
      );
    },
    /**
     * Updates the status of a particular transfer.
     */
    updateStatus: (
      params: DomainsTransferUpdateStatusParams
    ): Promise<
      NamecheapApiResponse<DomainsTransferUpdateStatusCommandResponse>
    > => {
      return this.request<DomainsTransferUpdateStatusCommandResponse>(
        "namecheap.domains.transfer.updateStatus",
        params
      );
    },
  };

  // --- Ssl Methods ---
  public ssl = {
    /**
     * Activates a newly purchased SSL certificate.
     */
    activate: (
      params: SslActivateParams
    ): Promise<NamecheapApiResponse<SslActivateCommandResponse>> => {
      return this.request<SslActivateCommandResponse>(
        "namecheap.ssl.activate",
        params,
        "POST"
      );
    },
    /**
     * Creates a new SSL certificate.
     */
    create: (
      params: SslCreateParams
    ): Promise<NamecheapApiResponse<SslCreateCommandResponse>> => {
      return this.request<SslCreateCommandResponse>(
        "namecheap.ssl.create",
        params,
        "POST"
      );
    },
    /**
     * Sets a new Domain Control Validation (DCV) method for a certificate.
     */
    editDCVMethod: (
      params: SslEditDCVMethodParams
    ): Promise<NamecheapApiResponse<SslEditDCVMethodCommandResponse>> => {
      const apiParams = { ...params } as SslEditDCVMethodParams;
      if ("dnsNames" in apiParams && Array.isArray(apiParams.dnsNames)) {
        apiParams.dnsNames = apiParams.dnsNames.join(",");
      }
      if ("dcvMethods" in apiParams && Array.isArray(apiParams.dcvMethods)) {
        apiParams.dcvMethods = apiParams.dcvMethods.join(",");
      }
      return this.request<SslEditDCVMethodCommandResponse>(
        "namecheap.ssl.editDCVMethod",
        apiParams,
        "POST"
      );
    },
    /**
     * Gets approver email list for the requested certificate.
     */
    getApproverEmailList: (
      params: SslGetApproverEmailListParams
    ): Promise<
      NamecheapApiResponse<SslGetApproverEmailListCommandResponse>
    > => {
      return this.request<SslGetApproverEmailListCommandResponse>(
        "namecheap.ssl.getApproverEmailList",
        params
      );
    },
    /**
     * Retrieves information about the requested SSL certificate.
     */
    getInfo: (
      params: SslGetInfoParams
    ): Promise<NamecheapApiResponse<SslGetInfoCommandResponse>> => {
      return this.request<SslGetInfoCommandResponse>(
        "namecheap.ssl.getInfo",
        params
      );
    },
    /**
     * Returns a list of SSL certificates for the particular user.
     */
    getList: (
      params?: SslGetListParams
    ): Promise<NamecheapApiResponse<SslGetListCommandResponse>> => {
      return this.request<SslGetListCommandResponse>(
        "namecheap.ssl.getList",
        params
      );
    },
    /**
     * Parses the CSR. Supports POST only.
     */
    parseCSR: (
      params: SslParseCSRParams
    ): Promise<NamecheapApiResponse<SslParseCSRCommandResponse>> => {
      return this.request<SslParseCSRCommandResponse>(
        "namecheap.ssl.parseCSR",
        params,
        "POST"
      );
    },
    /**
     * Purchases more add-on domains for an already purchased certificate.
     */
    purchaseMoreSans: (
      params: SslPurchaseMoreSansParams
    ): Promise<NamecheapApiResponse<SslPurchaseMoreSansCommandResponse>> => {
      return this.request<SslPurchaseMoreSansCommandResponse>(
        "namecheap.ssl.purchasemoresans",
        params,
        "POST"
      );
    },
    /**
     * Reissues an SSL certificate.
     */
    reissue: (
      params: SslReissueParams
    ): Promise<NamecheapApiResponse<SslReissueCommandResponse>> => {
      return this.request<SslReissueCommandResponse>(
        "namecheap.ssl.reissue",
        params,
        "POST"
      );
    },
    /**
     * Renews an SSL certificate.
     */
    renew: (
      params: SslRenewParams
    ): Promise<NamecheapApiResponse<SslRenewCommandResponse>> => {
      return this.request<SslRenewCommandResponse>(
        "namecheap.ssl.renew",
        params,
        "POST"
      );
    },
    /**
     * Resends the approver email.
     */
    resendApproverEmail: (
      params: SslResendApproverEmailParams
    ): Promise<NamecheapApiResponse<SslResendApproverEmailCommandResponse>> => {
      return this.request<SslResendApproverEmailCommandResponse>(
        "namecheap.ssl.resendApproverEmail",
        params
      );
    },
    /**
     * Resends the fulfillment email containing the certificate.
     */
    resendFulfillmentEmail: (
      params: SslResendFulfillmentEmailParams
    ): Promise<
      NamecheapApiResponse<SslResendFulfillmentEmailCommandResponse>
    > => {
      return this.request<SslResendFulfillmentEmailCommandResponse>(
        "namecheap.ssl.resendfulfillmentemail",
        params
      );
    },
    /**
     * Revokes a re-issued SSL certificate. Supported for Comodo certs only.
     */
    revokeCertificate: (
      params: SslRevokeCertificateParams
    ): Promise<NamecheapApiResponse<SslRevokeCertificateCommandResponse>> => {
      return this.request<SslRevokeCertificateCommandResponse>(
        "namecheap.ssl.revokecertificate",
        params,
        "POST"
      );
    },
  };

  // --- Users Methods ---
  public users = {
    /**
     * Changes the password of the user's account.
     */
    changePassword: (
      params: UsersChangePasswordParams
    ): Promise<NamecheapApiResponse<UsersChangePasswordCommandResponse>> => {
      return this.request<UsersChangePasswordCommandResponse>(
        "namecheap.users.changePassword",
        params,
        "POST"
      );
    },
    /**
     * Creates a new user account at Namecheap. [11, 12]
     */
    create: (
      params: UsersCreateParams
    ): Promise<NamecheapApiResponse<UsersCreateCommandResponse>> => {
      return this.request<UsersCreateCommandResponse>(
        "namecheap.users.create",
        params,
        "POST"
      );
    },
    /**
     * Creates a request to add funds through a credit card. [9, 10]
     */
    createAddFundsRequest: (
      params: UsersCreateAddFundsRequestParams
    ): Promise<
      NamecheapApiResponse<UsersCreateAddFundsRequestCommandResponse>
    > => {
      return this.request<UsersCreateAddFundsRequestCommandResponse>(
        "namecheap.users.createaddfundsrequest",
        params,
        "POST"
      );
    },
    /**
     * Gets the status of an add funds request.
     */
    getAddFundsStatus: (
      params: UsersGetAddFundsStatusParams
    ): Promise<NamecheapApiResponse<UsersGetAddFundsStatusCommandResponse>> => {
      return this.request<UsersGetAddFundsStatusCommandResponse>(
        "namecheap.users.getaddfundsstatus",
        params
      );
    },
    /**
     * Gets information about funds in the user's account.
     */
    getBalances: (): Promise<
      NamecheapApiResponse<UsersGetBalancesCommandResponse>
    > => {
      return this.request<UsersGetBalancesCommandResponse, undefined>(
        "namecheap.users.getBalances",
        undefined
      );
    },
    /**
     * Returns pricing information for a requested product type.
     */
    getPricing: (
      params: UsersGetPricingParams
    ): Promise<NamecheapApiResponse<UsersGetPricingCommandResponse>> => {
      return this.request<UsersGetPricingCommandResponse>(
        "namecheap.users.getPricing",
        params
      );
    },
    /**
     * Validates the username and password of user accounts.
     */
    login: (
      params: UsersLoginParams
    ): Promise<NamecheapApiResponse<UsersLoginCommandResponse>> => {
      return this.request<UsersLoginCommandResponse>(
        "namecheap.users.login",
        params,
        "POST"
      );
    },
    /**
     * Sends a password reset link to the end user's profile email ID.
     */
    resetPassword: (
      params: UsersResetPasswordParams
    ): Promise<NamecheapApiResponse<UsersResetPasswordCommandResponse>> => {
      return this.request<UsersResetPasswordCommandResponse>(
        "namecheap.users.resetPassword",
        params,
        "POST"
      );
    },
    /**
     * Updates user account information for the particular user.
     */
    update: (
      params: UsersUpdateParams
    ): Promise<NamecheapApiResponse<UsersUpdateCommandResponse>> => {
      return this.request<UsersUpdateCommandResponse>(
        "namecheap.users.update",
        params,
        "POST"
      );
    },
  };

  // --- Users.Address Methods ---
  public usersAddress = {
    /**
     * Creates a new address for the user. [13]
     */
    create: (
      params: UsersAddressCreateParams
    ): Promise<NamecheapApiResponse<UsersAddressCreateCommandResponse>> => {
      return this.request<UsersAddressCreateCommandResponse>(
        "namecheap.users.address.create",
        params,
        "POST"
      );
    },
    /**
     * Deletes the particular address for the user.
     */
    delete: (
      params: UsersAddressDeleteParams
    ): Promise<NamecheapApiResponse<UsersAddressDeleteCommandResponse>> => {
      return this.request<UsersAddressDeleteCommandResponse>(
        "namecheap.users.address.delete",
        params
      );
    },
    /**
     * Gets information for the requested addressID. [14]
     */
    getInfo: (
      params: UsersAddressGetInfoParams
    ): Promise<NamecheapApiResponse<UsersAddressGetInfoCommandResponse>> => {
      return this.request<UsersAddressGetInfoCommandResponse>(
        "namecheap.users.address.getInfo",
        params
      );
    },
    /**
     * Gets a list of addressIDs and addressnames associated with the user account.
     */
    getList: (): Promise<
      NamecheapApiResponse<UsersAddressGetListCommandResponse>
    > => {
      return this.request<UsersAddressGetListCommandResponse, undefined>(
        "namecheap.users.address.getList",
        undefined
      );
    },
    /**
     * Sets default address for the user.
     */
    setDefault: (
      params: UsersAddressSetDefaultParams
    ): Promise<NamecheapApiResponse<UsersAddressSetDefaultCommandResponse>> => {
      return this.request<UsersAddressSetDefaultCommandResponse>(
        "namecheap.users.address.setDefault",
        params
      );
    },
    /**
     * Updates the particular address of the user. [15, 16]
     */
    update: (
      params: UsersAddressUpdateParams
    ): Promise<NamecheapApiResponse<UsersAddressUpdateCommandResponse>> => {
      return this.request<UsersAddressUpdateCommandResponse>(
        "namecheap.users.address.update",
        params,
        "POST"
      );
    },
  };

  // --- DomainPrivacy (WhoisGuard) Methods ---
  public domainPrivacy = {
    /**
     * Changes domain privacy email address.
     */
    changeEmailAddress: (
      params: DomainPrivacyChangeEmailAddressParams
    ): Promise<
      NamecheapApiResponse<DomainPrivacyChangeEmailAddressCommandResponse>
    > => {
      return this.request<DomainPrivacyChangeEmailAddressCommandResponse>(
        "namecheap.whoisguard.changeemailaddress",
        params
      );
    },
    /**
     * Disables domain privacy protection.
     */
    disable: (
      params: DomainPrivacyDisableParams
    ): Promise<NamecheapApiResponse<DomainPrivacyDisableCommandResponse>> => {
      return this.request<DomainPrivacyDisableCommandResponse>(
        "namecheap.whoisguard.disable",
        params,
        "POST"
      );
    },
    /**
     * Enables domain privacy protection.
     */
    enable: (
      params: DomainPrivacyEnableParams
    ): Promise<NamecheapApiResponse<DomainPrivacyEnableCommandResponse>> => {
      return this.request<DomainPrivacyEnableCommandResponse>(
        "namecheap.whoisguard.enable",
        params,
        "POST"
      );
    },
    /**
     * Gets the list of domain privacy protection.
     */
    getList: (
      params?: DomainPrivacyGetListParams
    ): Promise<NamecheapApiResponse<DomainPrivacyGetListCommandResponse>> => {
      return this.request<DomainPrivacyGetListCommandResponse>(
        "namecheap.whoisguard.getList",
        params
      );
    },
    /**
     * Renews domain privacy protection.
     */
    renew: (
      params: DomainPrivacyRenewParams
    ): Promise<NamecheapApiResponse<DomainPrivacyRenewCommandResponse>> => {
      return this.request<DomainPrivacyRenewCommandResponse>(
        "namecheap.whoisguard.renew",
        params,
        "POST"
      );
    },
  };
}

export const namecheapXmlApi = new NamecheapApiClient({
  apiKey: process.env.NAMECHEAP_API_KEY as string,
  apiUser: process.env.NAMECHEAP_API_USER as string,
  clientIp: process.env.PUBLIC_IP as string,
  logRequests: true,
});
