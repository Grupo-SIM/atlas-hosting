import axios from "axios";

interface NamecheapConfig {
  apiUser: string;
  apiKey: string;
  username: string;
  clientIp: string;
  useSandbox?: boolean;
}

interface NamecheapResponse<T = any> {
  Status: "OK" | "ERROR";
  Errors?: Array<{
    Number: string;
    Message: string;
  }>;
  Warnings?: Array<{
    Number: string;
    Message: string;
  }>;
  RequestedCommand: string;
  Server: string;
  GMTTimeDifference: string;
  ExecutionTime: number;
  Data: T;
}

export default class NamecheapApi {
  private readonly baseUrl: string;
  private readonly defaultParams: Record<string, string>;

  constructor(config: NamecheapConfig) {
    this.baseUrl = config.useSandbox
      ? "https://api.sandbox.namecheap.com/xml.response"
      : "https://api.namecheap.com/xml.response";

    this.defaultParams = {
      ApiUser: config.apiUser,
      ApiKey: config.apiKey,
      UserName: config.username,
      ClientIp: config.clientIp,
    };
  }

  private async request<T = any>(
    command: string,
    params: Record<string, string | number | boolean> = {}
  ): Promise<T> {
    try {
      const response = await axios.get<NamecheapResponse<T>>(this.baseUrl, {
        params: {
          ...this.defaultParams,
          Command: command,
          ...params,
        },
      });

      const data = response.data;

      if (data.Status === "ERROR") {
        throw new Error(
          data.Errors?.map((e) => `${e.Number}: ${e.Message}`).join(", ") ||
            "Unknown error"
        );
      }

      return data.Data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Namecheap API Error:", error.response?.data);
      }
      throw error;
    }
  }

  // Domains
  public async domainsGetList() {
    return this.request("namecheap.domains.getList");
  }

  public async domainsGetInfo(domainName: string) {
    return this.request("namecheap.domains.getInfo", {
      DomainName: domainName,
    });
  }

  public async domainsGetContacts(domainName: string) {
    return this.request("namecheap.domains.getContacts", {
      DomainName: domainName,
    });
  }

  public async domainsCreate(
    domainName: string,
    years: number,
    registrant: {
      FirstName: string;
      LastName: string;
      Address1: string;
      City: string;
      StateProvince: string;
      PostalCode: string;
      Country: string;
      Phone: string;
      EmailAddress: string;
    }
  ) {
    return this.request("namecheap.domains.create", {
      DomainName: domainName,
      Years: years,
      ...Object.entries(registrant).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`Registrant${key}`]: value,
        }),
        {}
      ),
    });
  }

  public async domainsRenew(domainName: string, years: number) {
    return this.request("namecheap.domains.renew", {
      DomainName: domainName,
      Years: years,
    });
  }

  public async domainsGetTldList() {
    return this.request("namecheap.domains.getTldList");
  }

  public async domainsCheck(domainList: string[]) {
    return this.request("namecheap.domains.check", {
      DomainList: domainList.join(","),
    });
  }

  public async domainsReactivate(domainName: string) {
    return this.request("namecheap.domains.reactivate", {
      DomainName: domainName,
    });
  }

  public async domainsGetRegistrarLock(domainName: string) {
    return this.request("namecheap.domains.getRegistrarLock", {
      DomainName: domainName,
    });
  }

  public async domainsSetRegistrarLock(
    domainName: string,
    lockAction: "LOCK" | "UNLOCK"
  ) {
    return this.request("namecheap.domains.setRegistrarLock", {
      DomainName: domainName,
      LockAction: lockAction,
    });
  }

  // DNS
  public async dnsGetHosts(domainName: string) {
    return this.request("namecheap.domains.dns.getHosts", {
      DomainName: domainName,
    });
  }

  public async dnsSetHosts(
    domainName: string,
    hosts: Array<{
      HostName: string;
      RecordType:
        | "A"
        | "AAAA"
        | "CNAME"
        | "MX"
        | "MXE"
        | "TXT"
        | "URL"
        | "URL301"
        | "FRAME";
      Address: string;
      MXPref?: number;
      TTL?: number;
    }>
  ) {
    return this.request("namecheap.domains.dns.setHosts", {
      DomainName: domainName,
      ...hosts.reduce(
        (acc, host, index) => ({
          ...acc,
          [`HostName${index + 1}`]: host.HostName,
          [`RecordType${index + 1}`]: host.RecordType,
          [`Address${index + 1}`]: host.Address,
          ...(host.MXPref && { [`MXPref${index + 1}`]: host.MXPref }),
          ...(host.TTL && { [`TTL${index + 1}`]: host.TTL }),
        }),
        {}
      ),
    });
  }

  public async dnsGetList(domainName: string) {
    return this.request("namecheap.domains.dns.getList", {
      DomainName: domainName,
    });
  }

  public async dnsSetCustom(domainName: string, nameservers: string[]) {
    return this.request("namecheap.domains.dns.setCustom", {
      DomainName: domainName,
      ...nameservers.reduce(
        (acc, ns, index) => ({
          ...acc,
          [`Nameserver${index + 1}`]: ns,
        }),
        {}
      ),
    });
  }

  public async dnsSetDefault(domainName: string) {
    return this.request("namecheap.domains.dns.setDefault", {
      DomainName: domainName,
    });
  }

  // SSL
  public async sslGetList() {
    return this.request("namecheap.ssl.getList");
  }

  public async sslActivate(
    certificateID: number,
    domainName: string,
    approverEmail: string
  ) {
    return this.request("namecheap.ssl.activate", {
      CertificateID: certificateID,
      DomainName: domainName,
      ApproverEmail: approverEmail,
    });
  }

  public async sslGetInfo(certificateID: number) {
    return this.request("namecheap.ssl.getInfo", {
      CertificateID: certificateID,
    });
  }

  public async sslParseCSR(csr: string) {
    return this.request("namecheap.ssl.parseCSR", {
      CSR: csr,
    });
  }

  public async sslGetApproverEmailList(domainName: string) {
    return this.request("namecheap.ssl.getApproverEmailList", {
      DomainName: domainName,
    });
  }

  public async sslResendApproverEmail(certificateID: number) {
    return this.request("namecheap.ssl.resendApproverEmail", {
      CertificateID: certificateID,
    });
  }

  public async sslResendFulfillmentEmail(certificateID: number) {
    return this.request("namecheap.ssl.resendFulfillmentEmail", {
      CertificateID: certificateID,
    });
  }

  public async sslReissue(
    certificateID: number,
    domainName: string,
    approverEmail: string
  ) {
    return this.request("namecheap.ssl.reissue", {
      CertificateID: certificateID,
      DomainName: domainName,
      ApproverEmail: approverEmail,
    });
  }

  public async sslPurchase(
    years: number,
    type: string,
    domainName: string,
    approverEmail: string
  ) {
    return this.request("namecheap.ssl.purchase", {
      Years: years,
      Type: type,
      DomainName: domainName,
      ApproverEmail: approverEmail,
    });
  }

  public async sslRenew(
    years: number,
    certificateID: number,
    domainName: string,
    approverEmail: string
  ) {
    return this.request("namecheap.ssl.renew", {
      Years: years,
      CertificateID: certificateID,
      DomainName: domainName,
      ApproverEmail: approverEmail,
    });
  }

  public async sslRevoke(
    certificateID: number,
    certificateType: string,
    serialNumber: string
  ) {
    return this.request("namecheap.ssl.revoke", {
      CertificateID: certificateID,
      CertificateType: certificateType,
      SerialNumber: serialNumber,
    });
  }
}
