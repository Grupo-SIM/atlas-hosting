import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import * as Plesk from "@/plesk";
import SubscriptionApi from "./subscriptions";
import PleskWpToolkitApi from "./wp-toolkit";

export class PleskApi {
  private apiUrl: string;
  private rootUser: string;
  private rootPassword: string;
  private apiConfig: Plesk.Configuration;

  public pleskAxios: AxiosInstance;

  public clientsApi: Plesk.ClientsApi;
  public authApi: Plesk.AuthenticationApi;
  public cliApi: Plesk.CliApi;
  public domainsApi: Plesk.DomainsApi;
  public serverApi: Plesk.ServerApi;

  public wordpress: PleskWpToolkitApi;
  public subscriptions: SubscriptionApi;

  constructor() {
    this.apiUrl = process.env.PLESK_API_URL!;
    this.rootUser = process.env.PLESK_ROOT_USER!;
    this.rootPassword = process.env.PLESK_ROOT_PASSWORD!;

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
      console.log(response);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.request);
      }

      return null;
    }
  }

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
      const { data: domains } = await this.domainsApi.domainsGet();
      const foundDomain = domains.find((d) => d.name === domainName);

      if (!foundDomain) {
        return null;
      }

      return foundDomain;
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

  public async assignDomain(domainName: string, userId: number) {
    const user = await this.getUserById(userId);

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
          ftp_login: Math.random().toString(36).substring(2, 10),
          ftp_password: `D%$%` + Math.random().toString(36).substring(2, 10),
        },
      });

      console.log(data);

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(JSON.stringify(error.response?.data));
      }

      console.log(error);

      throw error;
    }
  }

  public async deleteDomain(domainId: number) {
    const { data } = await this.domainsApi.domainsIdDelete(domainId);
    console.log(data);
    return data;
  }

  public async listSubscriptions() {
    const data = await this.subscriptions.list();
    console.log(data);
    return data;
  }
}

const pleskApi = new PleskApi();
export default pleskApi;
