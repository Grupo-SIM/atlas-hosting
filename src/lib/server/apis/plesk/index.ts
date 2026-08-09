import https from "node:https";
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import * as Plesk from "@/plesk";
import SubscriptionApi from "./subscriptions";
import PleskWpToolkitApi from "./wp-toolkit";

export class PleskApi {
  private apiUrl: string;
  private apiKey: string | undefined;
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
    this.apiUrl = process.env.PLESK_API_URL || "http://placeholder";
    this.rootUser = process.env.PLESK_ROOT_USER || "";
    this.rootPassword = process.env.PLESK_ROOT_PASSWORD || "";
    this.apiKey = process.env.PLESK_API_KEY;

    // Se estivermos em build, evita logs de inicialização e configurações pesadas
    const isBuild = process.env.NEXT_PHASE === "phase-production-build";

    if (!isBuild) {
      console.log(
        `[PleskApi] Initializing for ${this.apiUrl} using ${this.apiKey ? "API Key" : "Basic Auth"}`
      );
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      Referer: `${this.apiUrl}/`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    };

    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }

    this.pleskAxios = axios.create({
      baseURL: this.apiUrl,
      headers,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      ...(this.apiKey
        ? {}
        : {
            auth: {
              password: this.rootPassword,
              username: this.rootUser,
            },
          }),
    });

    // Algumas instalações mantêm uma chave antiga no ambiente. Se o Plesk a
    // rejeitar, refazemos uma única vez com as credenciais root já configuradas.
    this.pleskAxios.interceptors.response.use(undefined, async error => {
      const config = error.config as
        | (AxiosRequestConfig & { __atlasBasicRetry?: boolean })
        | undefined;
      if (
        error.response?.status === 401 &&
        this.apiKey &&
        this.rootUser &&
        this.rootPassword &&
        config &&
        !config.__atlasBasicRetry
      ) {
        config.__atlasBasicRetry = true;
        config.headers = {
          ...config.headers,
          Authorization: `Basic ${Buffer.from(`${this.rootUser}:${this.rootPassword}`).toString("base64")}`,
          "X-API-Key": undefined,
        };
        return this.pleskAxios.request(config);
      }
      return Promise.reject(error);
    });

    this.apiConfig = new Plesk.Configuration({
      apiKey: this.apiKey,
      basePath: this.apiUrl,
      password: this.apiKey ? undefined : this.rootPassword,
      username: this.apiKey ? undefined : this.rootUser,
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
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log(
          `401 Unauthorized for domain ${domainName}. Response:`,
          JSON.stringify(error.response?.data)
        );
      } else if (axios.isAxiosError(error) && !error.response?.data?.code) {
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
        hosting_settings: {
          ftp_login: `user_${Math.random().toString(36).substring(2, 10)}`,
          ftp_password: `D%$%${Math.random().toString(36).substring(2, 10)}`,
          php_handler_id: "fastcgi",
          php_version: "8.2.28",
          ssl: true,
          upload_max_filesize: "10M",
          webmail: true,
        },
        hosting_type: Plesk.DomainRequestHostingTypeEnum.Virtual,
        name: domainName,
        ownerClient: {
          externalId: user.guid,
          guid: user.guid,
          id: user.id,
          login: user.login,
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
        hosting_settings: {
          ftp_login: `user_${Math.random().toString(36).substring(2, 10)}`,
          ftp_password: `D%$%${Math.random().toString(36).substring(2, 10)}`,
        },
        hosting_type: Plesk.DomainRequestHostingTypeEnum.Virtual,
        name: domainName,
        ownerClient: {
          externalId: user.guid,
          guid: user.guid,
          id: user.id,
          login: user.login,
        },
        plan: {
          name: "Coolify",
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
