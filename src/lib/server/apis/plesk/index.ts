import * as Plesk from "@/plesk";
import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import SubscriptionApi from "./subscriptions";
import PleskWpToolkitApi from "./wp-toolkit";

export class PleskApi {
  private apiUrl: string;
  private rootUser: string;
  private rootPassword: string;
  private apiConfig: Plesk.Configuration;

  public pleskAxios: AxiosInstance;

  public clientsApi: Plesk.ClientsApi;
  public databasesApi: Plesk.DatabasesApi;
  public authApi: Plesk.AuthenticationApi;
  public cliApi: Plesk.CliApi;
  public domainsApi: Plesk.DomainsApi;
  public serverApi: Plesk.ServerApi;
  public dnsApi: Plesk.DNSApi;

  public wordpress: PleskWpToolkitApi;
  public subscriptions: SubscriptionApi;

  constructor() {
    this.apiUrl = process.env.PLESK_API_URL as string;
    this.rootUser = process.env.PLESK_ROOT_USER as string;
    this.rootPassword = process.env.PLESK_ROOT_PASSWORD as string;

    this.pleskAxios = axios.create({
      baseURL: this.apiUrl,
    });

    this.apiConfig = new Plesk.Configuration({
      basePath: this.apiUrl,
      password: this.rootPassword,
      username: this.rootUser,
    });

    const initParameters: ConstructorParameters<typeof Plesk.ClientsApi> = [
      this.apiConfig,
      undefined,
      this.pleskAxios as ConstructorParameters<typeof Plesk.ClientsApi>[2],
    ];

    this.clientsApi = new Plesk.ClientsApi(...initParameters);
    this.authApi = new Plesk.AuthenticationApi(...initParameters);
    this.cliApi = new Plesk.CliApi(...initParameters);
    this.domainsApi = new Plesk.DomainsApi(...initParameters);
    this.serverApi = new Plesk.ServerApi(...initParameters);
    this.dnsApi = new Plesk.DNSApi(...initParameters);
    this.databasesApi = new Plesk.DatabasesApi(...initParameters);

    this.wordpress = new PleskWpToolkitApi(this.cliApi);
    this.subscriptions = new SubscriptionApi(this.cliApi);
  }

  private async withAuth<T extends AxiosResponse>(request: Promise<T>) {
    // try {
    // 	return
    // }
  }

  private async getAuthToken() {
    try {
      const response = await this.authApi.authKeysPost({});
      console.log(response);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.request);
      }
      return null;
    }
  }

  public async getClients() {
    try {
      const response = await this.clientsApi.clientsGet();
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.request);
      }

      return null;
    }
  }

  /* 
  await pleskApi.clientsApi.clientsPost({ email: "lucasgarrafielo19@gmail.com", login: "eurmn", name: "Lucas", password: "@RDvfp5Z", type: Plesk.ClientRequestTypeEnum.Admin });
  */
  public async createClient(params: Plesk.ClientRequest) {
    try {
      const response = await this.clientsApi.clientsPost(params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return error.response?.data;
      }

      return null;
    }
  }

  public async initServer() {
    try {
      const response = await this.cliApi.cliIdCallPost("extension", {
        params: ["--call", "wp-toolkit", "--list"],
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.request);
        return error.response?.data;
      }

      return null;
    }
  }

  public async getUserById(id: number) {
    const { data } = await this.clientsApi.clientsIdGet(id);
    return data;
  }

  public async getDomain(
    domainName: string
  ): Promise<Plesk.DomainResponse | null> {
    try {
      const { data: domains } = await this.domainsApi.domainsGet(domainName);

      if (!domains.length) {
        return null;
      }

      return domains[0];
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response?.data?.code) {
        console.log(
          `Axios error fetching domain ${domainName}:`,
          JSON.stringify(error.response?.data || error.message)
        );
      } else if (!axios.isAxiosError(error)) {
        console.log(`Non-axios error fetching domain ${domainName}:`, error);
      }
      throw error;
    }
  }

  // @RDvfp5Zaas22AA
  public async assignDomain(domainName: string, pleskId: number) {
    const user = await this.getUserById(pleskId);

    try {
      const { data } = await this.domainsApi.domainsPost({
        name: domainName,
        ownerClient: {
          externalId: user.guid,
          guid: user.guid,
          id: user.id,
          login: user.login,
        },
        hosting_type: Plesk.DomainRequestHostingTypeEnum.Virtual,
        hosting_settings: {
          php_handler_id: "fastcgi",
          php_version: "8.2.28",
          ssl: true,
          webmail: true,
          ftp_login: `user_${Math.random().toString(36).substring(2, 10)}`,
          ftp_password: `D%$%${Math.random().toString(36).substring(2, 10)}`,
        },
      });

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(JSON.stringify(error.response?.data));
      }

      throw error;
    }
  }

  public async deleteDomain(domainId: number) {
    const { data } = await this.domainsApi.domainsIdDelete(domainId);
    return data;
  }

  public async listSubscriptions() {
    const data = await this.subscriptions.list();
    return data;
  }

  public async createCoolifySubscription(domainName: string, pleskId: number) {
    const user = await this.getUserById(pleskId);

    try {
      const { data } = await this.domainsApi.domainsPost({
        name: domainName,
        ownerClient: {
          externalId: user.guid,
          guid: user.guid,
          id: user.id,
          login: user.login,
        },
        hosting_type: Plesk.DomainRequestHostingTypeEnum.Virtual,
        plan: {
          name: "Coolify",
        },
        hosting_settings: {
          ftp_login: `user_${Math.random().toString(36).substring(2, 10)}`,
          ftp_password: `D%$%${Math.random().toString(36).substring(2, 10)}`,
        },
      });

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(JSON.stringify(error.response?.data));
      }

      throw error;
    }
  }
}

const pleskApi = new PleskApi();
export default pleskApi;
