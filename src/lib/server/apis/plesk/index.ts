import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import * as Plesk from "plesk-api";
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
      console.log(response);
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

  public async getDomain(domainName: string) {
    try {
      const { data } = await this.domainsApi.domainsIdGet(228);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(JSON.stringify(error.response?.data));
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
        hostingType: Plesk.DomainRequestHostingTypeEnum.Virtual,
        hostingSettings: {
          php_handler_id: "fastcgi",
          php_version: "8.2.28",
          ssl: true,
          ftp_login: "test_login_",
          ftp_password: "Senha^^123a**",
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

  public async listSubscriptions() {
    const data = await this.subscriptions.list();
    console.log(data);
    return data;
  }
}

const pleskApi = new PleskApi();
export default pleskApi;
